from api.repositories.conversation_repository import ConversationRepository
from api.utils.exceptions import NotFoundException
import logging


class ConversationService:
    def __init__(self):
        self.repository = ConversationRepository()
        self.logger = logging.getLogger(__name__)

    def create_conversation(self, user, data: dict):
        """Create a new conversation"""
        try:
            data['user'] = user
            return self.repository.create(data)
        except Exception as e:
            self.logger.error(f"Error creating conversation: {str(e)}")
            raise

    def get_user_conversations(self, user_id: int):
        """Get all conversations for a user"""
        return self.repository.list({'user_id': user_id})

    def get_conversation(self, uuid: str, user_id: int):
        """Get a specific conversation"""
        conversation = self.repository.get_by_uuid(uuid)
        if not conversation or conversation.user_id != user_id:
            raise NotFoundException("Conversation not found")
        return conversation

    def update_conversation(self, uuid: str, user_id: int, data: dict):
        """Update a conversation"""
        conversation = self.get_conversation(uuid, user_id)
        return self.repository.update(conversation.id, data)

    def delete_conversation(self, uuid: str, user_id: int):
        """Delete a conversation"""
        conversation = self.get_conversation(uuid, user_id)
        return self.repository.delete(conversation.id)
