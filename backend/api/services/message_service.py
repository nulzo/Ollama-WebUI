from typing import Dict, Any, List
from api.repositories.message_repository import MessageRepository
from api.utils.exceptions import ServiceError, ValidationError
from api.serializers.message import MessageSerializer
from api.models.messages import Message
import logging


class MessageService:
    """Service for handling message CRUD operations"""

    def __init__(self):
        self.repository = MessageRepository()
        self.logger = logging.getLogger(__name__)

    async def create_message(self, data: Dict[str, Any], user) -> Message:
        """Create a new message"""
        try:
            serializer = MessageSerializer(data=data, context={'user': user})
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            message = await self.repository.create(serializer.validated_data)
            self.logger.info(f"Created message {message.id}")
            return message

        except Exception as e:
            self.logger.error(f"Error creating message: {str(e)}")
            raise ServiceError(f"Failed to create message: {str(e)}")

    async def get_conversation_messages(
            self,
            conversation_uuid: str,
            user
    ) -> List[Message]:
        """Get messages for a specific conversation"""
        try:
            messages = await self.repository.get_by_conversation(
                conversation_uuid=conversation_uuid,
                user=user
            )
            return messages
        except Exception as e:
            self.logger.error(f"Error fetching conversation messages: {str(e)}")
            raise ServiceError(str(e))

    async def get_user_messages(self, user) -> List[Message]:
        """Get all messages for a user"""
        try:
            return await self.repository.get_by_user(user)
        except Exception as e:
            self.logger.error(f"Error fetching user messages: {str(e)}")
            raise ServiceError(str(e))

    async def get_message(self, uuid: str, user) -> Message:
        """Get a specific message"""
        try:
            message = await self.repository.get_by_uuid(uuid, user)
            if not message:
                raise ValidationError("Message not found")
            return message
        except Exception as e:
            self.logger.error(f"Error fetching message: {str(e)}")
            raise ServiceError(str(e))