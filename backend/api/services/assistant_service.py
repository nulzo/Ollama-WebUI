from api.repositories.assistant_repository import AssistantRepository
from api.utils.exceptions import NotFoundException
import logging


class AssistantService:
    def __init__(self):
        self.repository = AssistantRepository()
        self.logger = logging.getLogger(__name__)

    async def create_assistant(self, data: dict):
        """Create a new assistant"""
        return await self.repository.create(data)

    async def get_assistant(self, assistant_id: int):
        """Get assistant by ID"""
        assistant = await self.repository.get_by_id(assistant_id)
        if not assistant:
            raise NotFoundException("Assistant not found")
        return assistant

    async def list_assistants(self, user_id: int = None):
        """List assistants"""
        filters = {'is_active': True}
        if user_id:
            filters['user_id'] = user_id
        return await self.repository.list(filters)

    async def update_assistant(self, assistant_id: int, data: dict):
        """Update assistant"""
        assistant = await self.get_assistant(assistant_id)
        return await self.repository.update(assistant.id, data)

    async def delete_assistant(self, assistant_id: int):
        """Delete assistant"""
        assistant = await self.get_assistant(assistant_id)
        return await self.repository.delete(assistant.id)
