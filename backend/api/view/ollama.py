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
        models = self.ollama_service.get_all_models()
        return Response(models, status=status.HTTP_200_OK)
