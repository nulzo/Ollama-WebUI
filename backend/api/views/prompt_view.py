from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from api.utils.responses.response import api_response
from api.services.chat_service import ChatService
from api.serializers.prompt_serializer import PromptRequestSerializer
from rest_framework.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)


class PromptView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.chat_service = ChatService()
        self.logger = logging.getLogger(__name__)

    def get(self, request, style=""):
        """Get prompts based on style and model"""
        try:
            # Validate request data
            serializer = PromptRequestSerializer(
                data={
                    "style": style,
                    "count": request.query_params.get("count", 5),
                    **request.query_params.dict(),
                }
            )

            if not serializer.is_valid():
                return api_response(
                    error={
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid request parameters",
                        "details": serializer.errors,
                    },
                    status=400,
                )

            validated_data = serializer.validated_data

            # Get model from query params or use default
            model_name = request.query_params.get("model", "llama3.2:3b")

            # Generate prompts using the chat service
            response = self.chat_service.get_prompts(
                model_name,
                validated_data["style"],
                count=validated_data["count"],
                user_id=request.user.id,
            )

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
