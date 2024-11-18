from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from services.ollama.ollama import OllamaService
import logging
from django.http import StreamingHttpResponse

logger = logging.getLogger(__name__)


class Chat(APIView):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ollama_service = OllamaService()
        self.logger = logging.getLogger(__name__)

    async def post(self, request, *args, **kwargs):
        # Create conversation first and get UUID
        conversation_uuid = await self.chat_service.create_conversation(request.data)
        
        # Start the streaming response
        response = await self.chat_service.handle_chat(request.data, request)
        
        if isinstance(response, dict) and "errors" in response:
            return Response(response, status=status.HTTP_400_BAD_REQUEST)
        
        if isinstance(response, StreamingHttpResponse):
            async def streaming_content():
                # Send conversation UUID as first chunk
                yield f'data: {{"conversation_uuid": "{conversation_uuid}"}}\n\n'
                
                # Then stream the rest of the response
                async for chunk in response.streaming_content:
                    yield chunk
            
            return StreamingHttpResponse(
                streaming_content(),
                content_type='text/event-stream'
            )
        
        return Response(response, status=status.HTTP_200_OK)

    async def get(self, request):
        models = await self.ollama_service.get_all_models()
        return Response(models, status=status.HTTP_200_OK)
    