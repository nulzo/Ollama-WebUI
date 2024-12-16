import logging
from typing import Any, Dict, List

from api.models.chat.message import Message
from api.repositories.message_repository import MessageRepository
from api.serializers.message import MessageSerializer
from api.utils.exceptions import ServiceError, ValidationError


class MessageService:
    """Service for handling message CRUD operations"""

    def __init__(self):
        self.repository = MessageRepository()
        self.logger = logging.getLogger(__name__)

    async def create_message(self, data: Dict[str, Any], user) -> Message:
        """Create a new message"""
        try:
            serializer = MessageSerializer(data=data, context={"user": user})
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            message = await self.repository.create(serializer.validated_data)
            self.logger.info(f"Created message {message.id}")
            return message

        except Exception as e:
            self.logger.error(f"Error creating message: {str(e)}")
            raise ServiceError(f"Failed to create message: {str(e)}")

    # async def get_conversation_messages(
    #         self,
    #         conversation_uuid: str,
    #         user
    # ) -> List[Message]:
    #     """Get messages for a specific conversation"""
    #     try:
    #         messages = await self.repository.get_by_conversation(
    #             conversation_uuid=conversation_uuid,
    #             user=user
    #         )
    #         return messages
    #     except Exception as e:
    #         self.logger.error(f"Error fetching conversation messages: {str(e)}")
    #         raise ServiceError(str(e))
    #
    # def get_user_messages(self, user) -> List[Message]:
    #     """Get all messages for a user"""
    #     try:
    #         return self.repository.get_by_user(user)
    #     except Exception as e:
    #         self.logger.error(f"Error fetching user messages: {str(e)}")
    #         raise ServiceError(str(e))

    def get_message(self, message_id: int, user) -> Message:
        """Get a single message with full details"""
        try:
            return Message.objects.select_related("conversation", "user", "model").get(
                id=message_id, conversation__user=user
            )
        except Message.DoesNotExist:
            raise ValidationError("Message not found or access denied")

    def get_user_messages(self, user):
        """Get messages for a user with optimized querying"""
        return Message.objects.filter(conversation__user=user)

    def get_conversation_messages(self, conversation_uuid: str, user):
        """Get messages for a specific conversation"""
        return Message.objects.filter(
            conversation__uuid=conversation_uuid, conversation__user=user
        ).select_related("conversation", "user", "model")
