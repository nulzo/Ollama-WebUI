import logging

from api.models import Message
from features.conversations.serializers import conversation
from features.conversations.serializers.conversation import ConversationSerializer
from features.conversations.services.conversation_service import ConversationService
from django.http import StreamingHttpResponse
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from features.conversations.serializers.message import MessageListSerializer, MessageSerializer
from features.conversations.services.message_service import MessageService
from api.utils.exceptions import ServiceError, ValidationError
from api.utils.pagination.paginator import StandardResultsSetPagination
from api.utils.responses.response import api_response


logger = logging.getLogger(__name__)


class ConversationViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for handling conversation operations.
    Returns minimal data for performance, with related data loaded lazily.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer
    pagination_class = StandardResultsSetPagination
    lookup_field = "uuid"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.conversation_service = ConversationService()
        self.logger = logging.getLogger(__name__)

    def get_queryset(self):
        """Filter conversations for the authenticated user"""
        return self.conversation_service.get_user_conversations(self.request.user.id)

    def list(self, request, *args, **kwargs):
        """Get minimal conversation list"""
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)

            # Return minimal data for each conversation
            data = [
                {
                    "uuid": conv.uuid,
                    "name": conv.name,
                    "created_at": conv.created_at,
                    "is_pinned": conv.is_pinned,
                    "updated_at": conv.updated_at,
                }
                for conv in page
            ]
            return api_response(
                data=self.get_paginated_response(data).data,
                links={"self": request.build_absolute_uri()},
            )

        except Exception as e:
            logger.error(f"Error fetching conversations: {str(e)}")
            return api_response(
                error={
                    "code": "CONVERSATION_FETCH_ERROR",
                    "message": "Failed to fetch conversations",
                    "details": str(e),
                },
                status=500,
            )

    def update(self, request, *args, **kwargs):
        try:
            # Fix: Pass request.user.id instead of request.user
            conversation = self.conversation_service.update_conversation(
                uuid=kwargs["uuid"],
                user_id=request.user.id,  # Changed from request.user
                data=request.data,
            )
            serializer = self.get_serializer(conversation)
            return api_response(data=serializer.data, links={"self": request.build_absolute_uri()})
        except ValidationError as e:
            self.logger.warning(f"Validation error: {str(e)}")
            return api_response(error={"code": "VALIDATION_ERROR", "message": str(e)}, status=400)
        except Exception as e:
            self.logger.error(f"Error updating conversation: {str(e)}")  # Changed error message
            return api_response(
                error={
                    "code": "CONVERSATION_UPDATE_ERROR",  # Changed error code
                    "message": "Failed to update conversation",  # Changed message
                    "details": str(e),
                },
                status=500,
            )

    def retrieve(self, request, *args, **kwargs):
        """Get single conversation details"""
        try:
            conversation = self.conversation_service.get_conversation(
                kwargs["uuid"], request.user.id
            )

            # Return minimal conversation data
            data = {
                "uuid": conversation.uuid,
                "name": conversation.name,
                "created_at": conversation.created_at,
                "is_pinned": conversation.is_pinned,
                "updated_at": conversation.updated_at,
            }
            return api_response(
                data=data,
                links={
                    "self": request.build_absolute_uri(),
                    "messages": f"/api/messages/?conversation={conversation.uuid}",
                },
            )

        except ValidationError as e:
            return api_response(error={"code": "VALIDATION_ERROR", "message": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Error retrieving conversation: {str(e)}")
            return api_response(
                error={
                    "code": "CONVERSATION_FETCH_ERROR",
                    "message": "Failed to fetch conversation",
                    "details": str(e),
                },
                status=500,
            )

    def create(self, request, *args, **kwargs):
        """Create new conversation"""
        try:
            conversation = self.conversation_service.create_conversation(request.user, request.data)
            return api_response(
                data={
                    "uuid": conversation.uuid,
                    "name": conversation.name,
                    "created_at": conversation.created_at,
                },
                status=201,
                links={
                    "self": request.build_absolute_uri(f"{conversation.uuid}/"),
                    "messages": f"/api/messages/?conversation={conversation.uuid}",
                },
            )
        except ValidationError as e:
            return api_response(error={"code": "VALIDATION_ERROR", "message": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Error creating conversation: {str(e)}")
            return api_response(
                error={
                    "code": "CONVERSATION_CREATE_ERROR",
                    "message": "Failed to create conversation",
                    "details": str(e),
                },
                status=500,
            )

    def destroy(self, request, *args, **kwargs):
        try:
            self.conversation_service.delete_conversation(
                uuid=kwargs["uuid"], user_id=request.user.id
            )
            return api_response(status=204)
        except Exception as e:
            self.logger.error(f"Error deleting conversation: {str(e)}")
            return api_response(
                error={
                    "code": "CONVERSATION_DELETE_ERROR",
                    "message": "Failed to delete conversation",
                    "details": str(e),
                },
                status=500,
            )

class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'limit'
    max_page_size = 100

    def get_paginated_response(self, data):
        return api_response(
            data=data,
            pagination={
                "page": self.page.number,
                "totalPages": self.page.paginator.num_pages,
                "hasMore": self.page.has_next(),
                "total": self.page.paginator.count
            },
            links={
                "self": self.request.build_absolute_uri(),
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
            }
        )

class MessageViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
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
    pagination_class = MessagePagination
    lookup_field = "id"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.message_service = MessageService()

    def get_serializer_class(self):
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

        # Order by created_at descending to get the most recent messages first
        return queryset.order_by("-created_at")


    def list(self, request, *args, **kwargs):
        """Get message list"""
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)    
                    
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            # If pagination is disabled, return standard response
            serializer = self.get_serializer(queryset, many=True)
            return api_response(
                data=serializer.data,
                links={"self": request.build_absolute_uri()}
            )

        except Exception as e:
            logger.error(f"Error fetching conversations: {str(e)}")
            return api_response(
                error={
                    "code": "CONVERSATION_FETCH_ERROR",
                    "message": "Failed to fetch conversations",
                    "details": str(e),
                },
                status=500,
            )

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
        
    def update(self, request, *args, **kwargs):
        try:
            message = self.get_object()
            
            # Handle other updates
            serializer = self.get_serializer(message, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            return api_response(
                data=serializer.data,
                links={"self": request.build_absolute_uri()}
            )
            
        except ValidationError as e:
            logger.warning(f"Validation error: {str(e)}")
            return api_response(
                error={"code": "VALIDATION_ERROR", "message": str(e)},
                status=400
            )
        except Exception as e:
            logger.error(f"Error updating message: {str(e)}")
            return api_response(
                error={
                    "code": "MESSAGE_UPDATE_ERROR",
                    "message": "Failed to update message",
                    "details": str(e)
                },
                status=500
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
