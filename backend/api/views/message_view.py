from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.http import StreamingHttpResponse
from api.serializers.message import MessageSerializer
from api.services.message_service import MessageService
from api.utils.exceptions import ServiceError, ValidationError
from api.utils.pagination import StandardResultsSetPagination
import logging

logger = logging.getLogger(__name__)


class MessageViewSet(mixins.CreateModelMixin,
                     mixins.ListModelMixin,
                     mixins.RetrieveModelMixin,
                     viewsets.GenericViewSet):
    """
    ViewSet for handling message operations.

    list: Get all messages for the authenticated user
    create: Create a new message and get AI response
    retrieve: Get a specific message
    conversation: Get messages for a specific conversation
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    lookup_field = 'uuid'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.message_service = MessageService()

    def get_serializer_class(self):
        return MessageSerializer

    def get_queryset(self):
        """Filter messages for the authenticated user"""
        queryset = self.message_service.get_user_messages(self.request.user)

        # Filter by conversation if specified
        conversation_uuid = self.request.query_params.get('conversation')
        if conversation_uuid:
            queryset = queryset.filter(conversation__uuid=conversation_uuid)

        return queryset.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """
        Create a new message and get AI response.

        Returns either a streaming response for AI chat or a regular response
        for message creation.
        """
        try:
            response = self.message_service.handle_user_message(
                data=request.data,
                user=request.user
            )

            if isinstance(response, dict):
                if "errors" in response:
                    return Response(
                        response,
                        status=status.HTTP_400_BAD_REQUEST
                    )
                return Response(response)

            if isinstance(response, StreamingHttpResponse):
                response["X-Accel-Buffering"] = "no"
                response["Cache-Control"] = "no-cache"
                return response

            return Response(response)

        except ValidationError as e:
            logger.warning(f"Validation error: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ServiceError as e:
            logger.error(f"Service error: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def conversation(self, request):
        """Get messages for a specific conversation"""
        conversation_uuid = request.query_params.get('uuid')
        if not conversation_uuid:
            return Response(
                {"error": "Conversation UUID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            messages = self.message_service.get_conversation_messages(
                conversation_uuid=conversation_uuid,
                user=request.user
            )
            serializer = self.get_serializer(messages, many=True)
            return Response(serializer.data)

        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error fetching conversation messages: {str(e)}")
            return Response(
                {"error": "Failed to fetch messages"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )