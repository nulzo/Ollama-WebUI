import logging
from typing import List, Optional

from django.db import transaction

from api.models.chat.assistant import Assistant
from api.utils.interfaces.base_repository import BaseRepository


class AssistantRepository(BaseRepository[Assistant]):
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    @transaction.atomic
    async def create(self, data: dict) -> Assistant:
        """Create a new assistant"""
        try:
            assistant = await Assistant.objects.acreate(
                name=data["name"],
                description=data.get("description", ""),
                model=data["model"],
                instructions=data.get("instructions", ""),
                user=data.get("user"),  # Optional user association
                is_active=data.get("is_active", True),
            )
            self.logger.info(f"Created assistant {assistant.id}")
            return assistant
        except Exception as e:
            self.logger.error(f"Error creating assistant: {str(e)}")
            raise

    async def get_by_id(self, id: int) -> Optional[Assistant]:
        try:
            return await Assistant.objects.aget(id=id)
        except Assistant.DoesNotExist:
            self.logger.warning(f"Assistant {id} not found")
            return None

    async def get_by_uuid(self, uuid: str) -> Optional[Assistant]:
        try:
            return await Assistant.objects.aget(uuid=uuid)
        except Assistant.DoesNotExist:
            self.logger.warning(f"Assistant with UUID {uuid} not found")
            return None

    async def list(self, filters: dict = None) -> List[Assistant]:
        queryset = Assistant.objects.all()
        if filters:
            queryset = queryset.filter(**filters)
        return await queryset.order_by("name").all()

    async def update(self, id: int, data: dict) -> Optional[Assistant]:
        try:
            assistant = await self.get_by_id(id)
            if not assistant:
                return None

            for key, value in data.items():
                setattr(assistant, key, value)
            await assistant.asave()
            return assistant
        except Exception as e:
            self.logger.error(f"Error updating assistant {id}: {str(e)}")
            return None

    async def delete(self, id: int) -> bool:
        try:
            assistant = await self.get_by_id(id)
            if not assistant:
                return False
            await assistant.adelete()
            return True
        except Exception as e:
            self.logger.error(f"Error deleting assistant {id}: {str(e)}")
            return False

    @transaction.atomic
    async def bulk_create(self, data_list: List[dict]) -> List[Assistant]:
        try:
            assistants = [
                Assistant(
                    name=data["name"],
                    description=data.get("description", ""),
                    model=data["model"],
                    instructions=data.get("instructions", ""),
                    user=data.get("user"),
                    is_active=data.get("is_active", True),
                )
                for data in data_list
            ]
            return await Assistant.objects.abulk_create(assistants)
        except Exception as e:
            self.logger.error(f"Error bulk creating assistants: {str(e)}")
            raise

    @transaction.atomic
    async def bulk_update(self, data_list: List[dict]) -> List[Assistant]:
        try:
            updated_assistants = []
            for data in data_list:
                if assistant_id := data.get("id"):
                    if updated_assistant := await self.update(assistant_id, data):
                        updated_assistants.append(updated_assistant)
            return updated_assistants
        except Exception as e:
            self.logger.error(f"Error bulk updating assistants: {str(e)}")
            raise

    # Additional helper methods
    async def get_user_assistants(self, user_id: int) -> List[Assistant]:
        """Get all assistants for a specific user"""
        return await self.list({"user_id": user_id})

    async def get_active_assistants(self) -> List[Assistant]:
        """Get all active assistants"""
        return await self.list({"is_active": True})
