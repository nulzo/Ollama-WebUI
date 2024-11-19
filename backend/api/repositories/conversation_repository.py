from typing import List, Optional
from django.db import transaction
from api.utils.interfaces.base_repository import BaseRepository
from api.models.conversation.conversation import Conversation
import logging


class ConversationRepository(BaseRepository[Conversation]):
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    @transaction.atomic
    async def create(self, data: dict) -> Conversation:
        """Create a new conversation"""
        try:
            conversation = await Conversation.objects.acreate(
                user=data['user'],
                title=data.get('title', 'New Conversation'),
                model=data.get('model'),
                system_prompt=data.get('system_prompt', '')
            )
            self.logger.info(f"Created conversation {conversation.uuid} for user {conversation.user.id}")
            return conversation
        except Exception as e:
            self.logger.error(f"Error creating conversation: {str(e)}")
            raise

    async def get_by_id(self, id: int) -> Optional[Conversation]:
        try:
            return await Conversation.objects.aget(id=id)
        except Conversation.DoesNotExist:
            self.logger.warning(f"Conversation {id} not found")
            return None

    async def get_by_uuid(self, uuid: str) -> Optional[Conversation]:
        try:
            return await Conversation.objects.aget(uuid=uuid)
        except Conversation.DoesNotExist:
            self.logger.warning(f"Conversation with UUID {uuid} not found")
            return None

    async def list(self, filters: dict = None) -> List[Conversation]:
        queryset = Conversation.objects.all()
        if filters:
            queryset = queryset.filter(**filters)
        return await queryset.order_by('-created_at').all()

    async def update(self, id: int, data: dict) -> Optional[Conversation]:
        try:
            conversation = await self.get_by_id(id)
            if not conversation:
                return None

            for key, value in data.items():
                setattr(conversation, key, value)
            await conversation.asave()
            return conversation
        except Exception as e:
            self.logger.error(f"Error updating conversation {id}: {str(e)}")
            return None

    async def delete(self, id: int) -> bool:
        try:
            conversation = await self.get_by_id(id)
            if not conversation:
                return False
            await conversation.adelete()
            return True
        except Exception as e:
            self.logger.error(f"Error deleting conversation {id}: {str(e)}")
            return False

    @transaction.atomic
    async def bulk_create(self, data_list: List[dict]) -> List[Conversation]:
        try:
            conversations = [
                Conversation(
                    user=data['user'],
                    title=data.get('title', 'New Conversation'),
                    model=data.get('model'),
                    system_prompt=data.get('system_prompt', '')
                )
                for data in data_list
            ]
            return await Conversation.objects.abulk_create(conversations)
        except Exception as e:
            self.logger.error(f"Error bulk creating conversations: {str(e)}")
            raise

    @transaction.atomic
    async def bulk_update(self, data_list: List[dict]) -> List[Conversation]:
        try:
            updated_conversations = []
            for data in data_list:
                if conv_id := data.get('id'):
                    if updated_conv := await self.update(conv_id, data):
                        updated_conversations.append(updated_conv)
            return updated_conversations
        except Exception as e:
            self.logger.error(f"Error bulk updating conversations: {str(e)}")
            raise

    async def get_user_conversations(self, user_id: int) -> List[Conversation]:
        """Get all conversations for a specific user"""
        return await self.list({'user_id': user_id})