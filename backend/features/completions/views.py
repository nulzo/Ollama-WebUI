import json
import logging

from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.utils.responses.response import api_response
from features.completions.services.chat_service import ChatService
from api.utils.exceptions import ServiceError, ValidationError
from api.utils.renderers import EventStreamRenderer

logger = logging.getLogger(__name__)


class ChatView(APIView):
    permission_classes = []
    renderer_classes = [EventStreamRenderer]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.chat_service = ChatService()
        
    def post(self, request):
        
        try:
            client_ip = request.META.get("REMOTE_ADDR")
            logger.info(f"Received chat request from user {request.user.id}")
            logger.info(f"Starting chat completion for IP: {client_ip} | Message")

            def stream_response():
                try:
                    for chunk in self.chat_service.generate_response(
                        data=request.data,
                        user=request.user
                    ):
                        yield f"data: {chunk}\n\n"
                except GeneratorExit:
                    logger.warning(f"Client cancelled request - IP: {client_ip}")
                    self.chat_service.cancel_generation()
                    raise
                except Exception as e:
                    logger.error(f"Error in stream: {str(e)}")
                    error_response = {
                        "error": str(e),
                        "status": "error"
                    }
                    yield f"data: {json.dumps(error_response)}\n\n"

            response = StreamingHttpResponse(
                streaming_content=stream_response(),
                content_type='text/event-stream'
            )

            # response["X-Accel-Buffering"] = "no"
            # response["Cache-Control"] = "no-cache"
            # response["Content-Type"] = "text/event-stream"
            
            response._handler = lambda: logger.info(f"Connection closed by client - IP: {client_ip}")

            return response

        except ValidationError as e:
            logger.warning(f"Validation error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as e:
            logger.error(f"Service error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.error(f"Error handling chat completion: {str(e)}")
            return api_response(
                error={
                    "code": "CHAT_COMPLETION_ERROR",
                    "message": "Failed to process chat completion",
                    "details": str(e)
                },
                status=500
            )

    def get(self, request):
        try:
            models = self.chat_service.get_available_models()
            return Response(models)
        except ServiceError as e:
            logger.error(f"Error fetching models: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
