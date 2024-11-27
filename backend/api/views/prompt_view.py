from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from api.utils.responses.response import api_response
from api.services.prompt_service import PromptService
import logging

logger = logging.getLogger(__name__)

class PromptView(APIView):
    permission_classes = [IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.prompt_service = PromptService()
        self.logger = logging.getLogger(__name__)

    def get(self, request, style=""):
        """
        Get actionable prompts based on style
        """
        try:
            prompts = self.prompt_service.get_actionable_prompts(style)
            return api_response(
                data={"prompts": prompts},
                links={
                    "self": request.build_absolute_uri()
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