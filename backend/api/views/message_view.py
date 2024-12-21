import logging

from django.http import StreamingHttpResponse
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from features.conversations.serializers.message import MessageListSerializer, MessageSerializer
from features.conversations.services.message_service import MessageService
from api.utils.exceptions import ServiceError, ValidationError
from api.utils.pagination.paginator import StandardResultsSetPagination
from api.utils.responses.response import api_response

logger = logging.getLogger(__name__)


class MessageViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for handling message operations.

    list: Get all messages for the authenticated user
    create: Create a new message and get AI response
    retrieve: Get a specific message
    conversation: Get messages for a specific conversation
    """

    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"  # Changed from uuid to id for individual message fetching

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.message_service = MessageService()

    def get_serializer_class(self):
        if self.action == "list":
            # Use minimal serializer for list view
            return MessageListSerializer
        return MessageSerializer

    def get_queryset(self):
        """Filter messages for the authenticated user"""
        queryset = self.message_service.get_user_messages(self.request.user)

        # Filter by conversation if specified
        conversation_uuid = self.request.query_params.get("conversation")
        if conversation_uuid:
            queryset = queryset.filter(conversation__uuid=conversation_uuid)

        # Select only necessary fields for list view
        if self.action == "list":
            queryset = queryset.only("id", "role", "created_at", "conversation")

        return queryset.order_by("created_at")

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return api_response(
                data=serializer.data,
                links={
                    "self": request.build_absolute_uri(),
                    "conversation": f"/api/conversations/{instance.conversation.uuid}/",
                },
            )
        except Exception as e:
            logger.error(f"Error fetching message: {str(e)}")
            return api_response(
                error={
                    "code": "MESSAGE_FETCH_ERROR",
                    "message": "Failed to fetch message",
                    "details": str(e),
                },
                status=500,
            )

    def create(self, request, *args, **kwargs):
        """
        Create a new message and get AI response.

        Returns either a streaming response for AI chat or a regular response
        for message creation.
        """
        try:
            response = self.message_service.handle_user_message(
                data=request.data, user=request.user
            )

            if isinstance(response, dict):
                if "errors" in response:
                    return Response(response, status=status.HTTP_400_BAD_REQUEST)
                return Response(response)

            if isinstance(response, StreamingHttpResponse):
                response["X-Accel-Buffering"] = "no"
                response["Cache-Control"] = "no-cache"
                return response

            return Response(response)

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

    @action(detail=False, methods=["get"])
    def conversation(self, request):
        """Get messages for a specific conversation"""
        conversation_uuid = request.query_params.get("uuid")
        if not conversation_uuid:
            return Response(
                {"error": "Conversation UUID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            messages = self.message_service.get_conversation_messages(
                conversation_uuid=conversation_uuid, user=request.user
            )
            serializer = self.get_serializer(messages, many=True)
            return Response(serializer.data)

        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error fetching conversation messages: {str(e)}")
            return Response(
                {"error": "Failed to fetch messages"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MessageDetailView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.message_service = MessageService()


class MessageDetailView(APIView):
    def get(self, request, message_id):
        try:
            message = self.message_service.get_message(message_id, request.user)
            serializer = MessageSerializer(message)
            return api_response(
                data=serializer.data,
                links={
                    "self": request.build_absolute_uri(),
                    "conversation": f"/api/conversations/{message.conversation.uuid}/",
                },
            )
        except Exception as e:
            logger.error(f"Error fetching message: {str(e)}")
            return api_response(
                error={
                    "code": "MESSAGE_FETCH_ERROR",
                    "message": "Failed to fetch message",
                    "details": str(e),
                },
                status=500,
            )
