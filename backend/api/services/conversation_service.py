from api.repositories.conversation_repository import ConversationRepository
from api.core.exceptions import NotFoundException
import logging


class ConversationService:
    def __init__(self):
        self.repository = ConversationRepository()
        self.logger = logging.getLogger(__name__)

    async def create_conversation(self, user, data: dict):
        """Create a new conversation"""
        try:
            data['user'] = user
            return await self.repository.create(data)
        except Exception as e:
            self.logger.error(f"Error creating conversation: {str(e)}")
            raise

    async def get_user_conversations(self, user_id: int):
        """Get all conversations for a user"""
        return await self.repository.list({'user_id': user_id})

    async def get_conversation(self, uuid: str, user_id: int):
        """Get a specific conversation"""
        conversation = await self.repository.get_by_uuid(uuid)
        if not conversation or conversation.user_id != user_id:
            raise NotFoundException("Conversation not found")
        return conversation

    async def update_conversation(self, uuid: str, user_id: int, data: dict):
        """Update a conversation"""
        conversation = await self.get_conversation(uuid, user_id)
        return await self.repository.update(conversation.id, data)

    async def delete_conversation(self, uuid: str, user_id: int):
        """Delete a conversation"""
        conversation = await self.get_conversation(uuid, user_id)
        return await self.repository.delete(conversation.id)
