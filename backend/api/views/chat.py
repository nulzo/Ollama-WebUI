from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import StreamingHttpResponse

from api.renderers import EventStreamRenderer
from api.services.chat import ChatService
import logging

logger = logging.getLogger(__name__)


class Chat(APIView):
    renderer_classes = [EventStreamRenderer]  # Add this

    def __init__(self, **kwargs):
        self.chat_service = ChatService()
        super().__init__(**kwargs)

    def post(self, request, *args, **kwargs):
        response = self.chat_service.handle_chat(request.data, request)
        
        if isinstance(response, dict) and "errors" in response:
            return Response(response, status=status.HTTP_400_BAD_REQUEST)
        
        if isinstance(response, StreamingHttpResponse):
            response["Content-Type"] = "text/event-stream"
            response["Cache-Control"] = "no-cache"
            response["Connection"] = "keep-alive"
            response["X-Accel-Buffering"] = "no"
            return response
        
        return Response(response, status=status.HTTP_200_OK)

    def get(self, request):
        return Response({}, status=status.HTTP_200_OK)
