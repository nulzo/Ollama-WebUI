from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import StreamingHttpResponse
from rest_framework.decorators import renderer_classes
from api.services.chat import ChatService
from api.renderers import EventStreamRenderer
import logging


logger = logging.getLogger(__name__)

@renderer_classes([EventStreamRenderer])
class Chat(APIView):
    def __init__(self, **kwargs):
        self.chat_service = ChatService()
        self.logger = logging.getLogger(__name__)
        super().__init__(**kwargs)

    def post(self, request, *args, **kwargs):
        try:
            self.logger.info(f"Received chat request from user {request.user}")
            self.logger.debug(f"Request data: {request.data}")
            
            response = self.chat_service.handle_chat(request.data, request)
            
            if isinstance(response, dict) and "errors" in response:
                self.logger.warning(f"Bad request: {response}")
                return Response(response, status=status.HTTP_400_BAD_REQUEST)
            
            if isinstance(response, StreamingHttpResponse):
                response["X-Accel-Buffering"] = "no"
                response["Cache-Control"] = "no-cache"
                response["Connection"] = "keep-alive"
                return response
            self.logger.info("Returning regular response")
            return Response(response, status=status.HTTP_200_OK)
            
        except Exception as e:
            self.logger.error(f"Chat error: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        models = self.chat_service.get_all_models()
        return Response(models, status=status.HTTP_200_OK)