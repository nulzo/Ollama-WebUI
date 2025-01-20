import json
import logging

from django.http import StreamingHttpResponse
from rest_framework import status

from api.utils.responses.response import api_response
from features.completions.services.chat_service import ChatService
from api.utils.exceptions import ServiceError, ValidationError
from api.utils.renderers import EventStreamRenderer
import base64
from rest_framework.decorators import action
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from features.completions.models import MessageImage
from features.completions.serializers.image_serializer import MessageImageSerializer


logger = logging.getLogger(__name__)


class ChatViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    renderer_classes = [EventStreamRenderer]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.chat_service = ChatService()
        self.logger = logger
        
    @action(detail=False, methods=['post'])
    def chat(self, request):
        try:
            self.logger.info(f"Request user: {request.user}")
            self.logger.info(f"Auth header: {request.headers.get('Authorization')}")
            self.logger.info(f"Request data: {request.data}")
            
            # Authentication is already verified by permission_classes
            # Just verify we have a valid user object
            if not request.user or not request.user.id:
                return Response(
                    {"error": "Valid user account required"}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )

            client_ip = request.META.get("REMOTE_ADDR")
            self.logger.info(f"Received chat request from user {request.user.id}")
            self.logger.info(f"Starting chat completion for IP: {client_ip} | Message")

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


class MessageImageViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageImageSerializer

    def get_queryset(self):
        return MessageImage.objects.filter(message__conversation__user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            # Read the file content
            instance.image.seek(0)  # Ensure we're at the start of the file
            image_bytes = instance.image.read()
            image_data = base64.b64encode(image_bytes).decode("utf-8")

            return Response(
                {
                    "data": {  # Wrap in data object to match expected format
                        "id": instance.id,
                        "image": f"data:image/jpeg;base64,{image_data}",
                        "order": instance.order,
                    }
                }
            )
        except Exception as e:
            return Response({"error": f"Error processing image: {str(e)}"}, status=500)
