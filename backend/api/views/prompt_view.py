from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from api.utils.responses.response import api_response
from api.services.chat_service import ChatService
from api.models.models.model import Model
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
            # Get model from query params or use default
            model_name = request.query_params.get('model', 'llama3.2:3b')

            # Generate prompts using the chat service
            response = self.chat_service.get_prompts(model_name, style, user_id=request.user.id)
            
            return api_response(
                data={
                    **response,
                    "metadata": {
                        "style": style or "default",
                        "provider": "openai" if model_name.startswith("gpt") else "ollama",
                        "model": model_name
                    }
                }
            )
            
        except Exception as e:
            self.logger.error(f"Error generating prompts: {str(e)}")
            return api_response(
                error={
                    "code": "PROMPT_GENERATION_ERROR",
                    "message": "Failed to generate prompts",
                    "details": str(e)
                },
                status=500
            )