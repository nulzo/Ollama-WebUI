from rest_framework import status, viewsets
from rest_framework.decorators import action

from features.prompts.serializers.custom_prompt_serializer import CustomPromptSerializer
from features.prompts.models import CustomPrompt

import logging

from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from features.prompts.serializers.prompt_serializer import PromptRequestSerializer
from features.completions.services.chat_service import ChatService
from api.utils.responses.response import api_response


class CustomPromptViewSet(viewsets.ModelViewSet):
    """ViewSet for managing saved prompts."""

    serializer_class = CustomPromptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all saved prompts for the current user"""
        return CustomPrompt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Create a new saved prompt"""
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                error={
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid data provided",
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        self.perform_create(serializer)
        return api_response(data=serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return api_response(
                data={"message": "Saved prompt successfully deleted"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return api_response(
                error={
                    "code": "DELETE_ERROR",
                    "message": "Failed to delete saved prompt",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )




class PromptViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.chat_service = ChatService()
        self.logger = logging.getLogger(__name__)
        
        # Initialize prompt service directly
        from features.prompts.services.prompt_service import (
            PromptBuilderService,
            PromptService,
            PromptTemplateService,
            PromptVariantService,
        )
        self.prompt_service = PromptService(
            template_service=PromptTemplateService(),
            variant_service=PromptVariantService(),
            builder_service=PromptBuilderService(),
            provider=None,  # Will be set when needed
        )

    @action(detail=False, methods=['get'])
    def show(self, request):
        """Get prompts based on style and model"""
        try:
            self.logger.info(f"Prompt show action called with params: {request.query_params}")
            
            # Validate request data
            serializer = PromptRequestSerializer(
                data={
                    "style": request.query_params.get("style", ""),
                    "count": request.query_params.get("count", 5),
                    "model": request.query_params.get("model", "llama3.2:3b"),
                    **request.query_params.dict(),
                }
            )
            
            self.logger.info(f"Serializer data: {serializer.initial_data}")

            if not serializer.is_valid():
                self.logger.error(f"Serializer validation error: {serializer.errors}")
                return api_response(
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid request parameters",
                        "details": serializer.errors,
                    },
                    status=400,
                )

            validated_data = serializer.validated_data
            model_name = validated_data.get("model", "llama3.2:3b")
            
            self.logger.info(f"Validated data: {validated_data}")
            self.logger.info(f"Using model: {model_name}")

            try:
                response = self.chat_service.get_prompts(
                    model_name,
                    validated_data["style"],
                    count=validated_data["count"],
                    user_id=request.user.id,
                )
                
                self.logger.info(f"Chat service response: {response}")
                
                return api_response(
                    data={
                        **response,
                        "metadata": {
                            "style": validated_data["style"] or "default",
                            "provider": "openai" if model_name.startswith("gpt") else "ollama",
                            "model": model_name,
                            "count": validated_data["count"],
                        },
                    }
                )
            except Exception as e:
                self.logger.error(f"Error from chat service: {str(e)}")
                # Return default prompts if chat service fails
                default_prompts = self.chat_service.prompt_service.get_default_prompts(validated_data["style"])
                return api_response(
                    data={
                        "prompts": default_prompts,
                        "metadata": {
                            "style": validated_data["style"] or "default",
                            "provider": "default",
                            "model": "default",
                            "count": validated_data["count"],
                            "is_fallback": True,
                        },
                    }
                )

        except ValidationError as e:
            self.logger.warning(f"Validation error: {str(e)}")
            return api_response(
                error={
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid request parameters",
                    "details": str(e),
                },
                status=400,
            )
        except Exception as e:
            self.logger.error(f"Error generating prompts: {str(e)}")
            return api_response(
                error={
                    "code": "PROMPT_GENERATION_ERROR",
                    "message": "Failed to generate prompts",
                    "details": str(e),
                },
                status=500,
            )