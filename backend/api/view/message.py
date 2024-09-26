from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from services.message.message_service import MessageService
from api.serializers.message import MessageSerializer
import logging
from django.http import StreamingHttpResponse

logger = logging.getLogger(__name__)


class MessageView(APIView):
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.message_service = MessageService()

    def post(self, request, *args, **kwargs):
        response = self.message_service.handle_user_message(request.data)
        
        logger.info(f"Message: {response}.")

        if isinstance(response, dict) and "errors" in response:
            return Response(response, status=status.HTTP_400_BAD_REQUEST)
        
        if isinstance(response, StreamingHttpResponse):
            return response
        
        # If it's not a streaming response or an error, it's a regular response
        return Response(response, status=status.HTTP_200_OK)

    def get(self, request):
        messages = self.message_service.message_repository.get_all_messages()
        serialized_messages = MessageSerializer(messages, many=True)
        return Response(serialized_messages.data, status=status.HTTP_200_OK)
