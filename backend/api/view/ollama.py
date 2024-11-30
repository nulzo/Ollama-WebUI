from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from services.ollama.ollama import OllamaService
import logging

logger = logging.getLogger(__name__)


class OllamaModels(APIView):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ollama_service = OllamaService()

    def post(self, request, *args, **kwargs):
        return Response({}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        """
        Get all models or a specific model's details
        
        Query Parameters:
        - name: Optional. The name of the specific model to fetch details for
        """
        model_name = request.query_params.get('name')
        
        try:
            if model_name:
                # Get specific model details
                model = self.ollama_service.get_model(model_name)
                if model is None:
                    return Response(
                        {"error": "Model not found"}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                return Response(model, status=status.HTTP_200_OK)
            else:
                # Get all models
                models = self.ollama_service.get_all_models()
                return Response(models, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error fetching models: {e}")
            return Response(
                {"error": "Failed to fetch models"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    

class OllamaPrompts(APIView):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ollama_service = OllamaService()

    def get(self, request, style=''):
        ollama_service = OllamaService()
        prompts = ollama_service.get_actionable_prompts(style)
        return Response({"prompts": prompts})
