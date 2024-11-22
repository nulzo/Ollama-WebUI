from typing import List, Optional
from django.db import transaction
from api.utils.interfaces.base_repository import BaseRepository
from api.models.conversation.conversation import Conversation
from api.models.messages.message import Message
import logging


class MessageRepository(BaseRepository[Message]):
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    @transaction.atomic
    def create(self, data: dict) -> Message:
        """Create a new message"""
        try:
            message = Message.objects.create(
                conversation=data['conversation'],
                content=data['content'],
                role=data['role'],
                model=data['model'],
                user=data['user'],
                images=data.get('images', [])
            )
            self.logger.info(f"Created message {message.id} in conversation {message.conversation.uuid}")
            return message
        except Exception as e:
            self.logger.error(f"Error creating message: {str(e)}")
            raise

    def get_by_id(self, id: int) -> Optional[Message]:
        """Get a message by ID"""
        try:
            return Message.objects.get(id=id)
        except Message.DoesNotExist:
            self.logger.warning(f"Message {id} not found")
            return None

    def get_by_uuid(self, uuid: str) -> Optional[Message]:
        """Get a message by UUID"""
        try:
            return Message.objects.get(uuid=uuid)
        except Message.DoesNotExist:
            self.logger.warning(f"Message with UUID {uuid} not found")
            return None

    def list(self, filters: dict = None) -> List[Message]:
        """List messages with optional filters"""
        queryset = Message.objects.all()
        if filters:
            queryset = queryset.filter(**filters)
        return queryset.order_by('created_at').all()

    def update(self, id: int, data: dict) -> Optional[Message]:
        """Update a message"""
        try:
            message = self.get_by_id(id)
            if not message:
                return None

            for key, value in data.items():
                setattr(message, key, value)
            message.save()
            return message
        except Exception as e:
            self.logger.error(f"Error updating message {id}: {str(e)}")
            return None

    def delete(self, id: int) -> bool:
        """Delete a message"""
        try:
            message = self.get_by_id(id)
            if not message:
                return False
            message.delete()
            return True
        except Exception as e:
            self.logger.error(f"Error deleting message {id}: {str(e)}")
            return False

    @transaction.atomic
    def bulk_create(self, data_list: List[dict]) -> List[Message]:
        """Create multiple messages"""
        try:
            messages = [
                Message(
                    conversation=data['conversation'],
                    content=data['content'],
                    role=data['role'],
                    model=data['model'],
                    user=data['user'],
                    images=data.get('images', [])
                )
                for data in data_list
            ]
            return Message.objects.bulk_create(messages)
        except Exception as e:
            self.logger.error(f"Error bulk creating messages: {str(e)}")
            raise

    @transaction.atomic
    def bulk_update(self, data_list: List[dict]) -> List[Message]:
        """Update multiple messages"""
        try:
            updated_messages = []
            for data in data_list:
                if message_id := data.get('id'):
                    if updated_message := self.update(message_id, data):
                        updated_messages.append(updated_message)
            return updated_messages
        except Exception as e:
            self.logger.error(f"Error bulk updating messages: {str(e)}")
            raise

    def get_conversation_messages(self, conversation_id: int) -> List[Message]:
        """Get all messages for a conversation ordered by creation time"""
        return self.list({'conversation_id': conversation_id})

    def get_conversation_by_uuid(self, uuid: str) -> Optional[Conversation]:
        """Get a conversation by its UUID"""
        try:
            return Conversation.objects.get(uuid=uuid)
        except Conversation.DoesNotExist:
            self.logger.warning(f"Conversation with UUID {uuid} not found")
            return None
