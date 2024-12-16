import logging

from django.http import StreamingHttpResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.services.chat_service import ChatService
from api.utils.exceptions import ServiceError, ValidationError
from api.utils.renderers import EventStreamRenderer

logger = logging.getLogger(__name__)


class ChatView(APIView):
    # permission_classes = [IsAuthenticated]
    renderer_classes = [EventStreamRenderer]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.chat_service = ChatService()

    def post(self, request):
        try:
            client_ip = request.META.get("REMOTE_ADDR")
            logger.info(f"Received chat request from user {request.user.id}")

            def stream_response():
                try:
                    for chunk in self.chat_service.generate_response(
                        serializer_data=request.data, user=request.user
                    ):
                        yield f"data: {chunk}\n\n"
                except GeneratorExit:
                    self.logger.warning(
                        f"Client disconnected - User: {request.user.id} | IP: {client_ip}"
                    )
                    self.chat_service.cancel_generation()
                    raise

            response = StreamingHttpResponse(
                streaming_content=stream_response(), content_type="text/event-stream"
            )

            response["X-Accel-Buffering"] = "no"
            response["Cache-Control"] = "no-cache"
            response["Connection"] = "keep-alive"

            return response

        except ValidationError as e:
            logger.warning(f"Validation error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except ServiceError as e:
            logger.error(f"Service error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
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
