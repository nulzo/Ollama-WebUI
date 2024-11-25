from typing import List, Optional
from django.db import transaction
from api.utils.interfaces.base_repository import BaseRepository
from api.models.agent.agent import Agent
import logging


class AgentRepository(BaseRepository[Agent]):
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    @transaction.atomic
    def create(self, data: dict) -> Agent:
        """Create a new agent"""
        try:
            agent = Agent.objects.create(
                display_name=data["display_name"],
                description=data.get("description", ""),
                profile_picture=data.get("profile_picture", ""),
                model=data["model"],
                system_prompt=data.get("system_prompt", ""),
                enabled=data.get("enabled", True),
                files=data.get("files", False),
                function_call=data.get("function_call", False),
                vision=data.get("vision", False),
                max_output=data.get("max_output", 2048),
                tokens=data.get("tokens", 2048),
                num_ctx=data.get("num_ctx", 4096),
                low_vram=data.get("low_vram", False),
                embedding_only=data.get("embedding_only", False),
                seed=data.get("seed", 0),
                num_predict=data.get("num_predict", 128),
                temperature=data.get("temperature", 0.8),
                top_k=data.get("top_k", 40),
                top_p=data.get("top_p", 0.95),
                tfs_z=data.get("tfs_z", 1.0),
                typical_p=data.get("typical_p", 1.0),
                repeat_last_n=data.get("repeat_last_n", 64),
                repeat_penalty=data.get("repeat_penalty", 1.1),
                presence_penalty=data.get("presence_penalty", 0.0),
                frequency_penalty=data.get("frequency_penalty", 0.0),
                penalize_newline=data.get("penalize_newline", False),
                stop=data.get("stop", []),
                user=data["user"],
            )
            self.logger.info(f"Created agent {agent.id}")
            return agent
        except Exception as e:
            self.logger.error(f"Error creating agent: {str(e)}")
            raise

    def get_by_id(self, id: int) -> Optional[Agent]:
        try:
            return Agent.objects.get(id=id)
        except Agent.DoesNotExist:
            self.logger.warning(f"Agent {id} not found")
            return None

    def get_by_uuid(self, uuid: str) -> Optional[Agent]:
        try:
            return Agent.objects.get(uuid=uuid)
        except Agent.DoesNotExist:
            self.logger.warning(f"Agent with UUID {uuid} not found")
            return None

    def list(self, filters: dict = None) -> List[Agent]:
        queryset = Agent.objects.all()
        if filters:
            queryset = queryset.filter(**filters)
        return queryset.order_by("display_name").all()

    def update(self, id: int, data: dict) -> Optional[Agent]:
        try:
            agent = self.get_by_id(id)
            if not agent:
                return None

            for key, value in data.items():
                setattr(agent, key, value)
            agent.asave()
            return agent
        except Exception as e:
            self.logger.error(f"Error updating agent {id}: {str(e)}")
            return None

    def delete(self, id: int) -> bool:
        try:
            agent = self.get_by_id(id)
            if not agent:
                return False
            agent.adelete()
            return True
        except Exception as e:
            self.logger.error(f"Error deleting agent {id}: {str(e)}")
            return False

    @transaction.atomic
    def bulk_create(self, data_list: List[dict]) -> List[Agent]:
        try:
            agents = [
                Agent(
                    display_name=data["display_name"],
                    description=data.get("description", ""),
                    profile_picture=data.get("profile_picture", ""),
                    model=data["model"],
                    system_prompt=data.get("system_prompt", ""),
                    enabled=data.get("enabled", True),
                    files=data.get("files", False),
                    function_call=data.get("function_call", False),
                    vision=data.get("vision", False),
                    max_output=data.get("max_output", 2048),
                    tokens=data.get("tokens", 2048),
                    num_ctx=data.get("num_ctx", 4096),
                    low_vram=data.get("low_vram", False),
                    embedding_only=data.get("embedding_only", False),
                    seed=data.get("seed", 0),
                    num_predict=data.get("num_predict", 128),
                    temperature=data.get("temperature", 0.8),
                    top_k=data.get("top_k", 40),
                    top_p=data.get("top_p", 0.95),
                    tfs_z=data.get("tfs_z", 1.0),
                    typical_p=data.get("typical_p", 1.0),
                    repeat_last_n=data.get("repeat_last_n", 64),
                    repeat_penalty=data.get("repeat_penalty", 1.1),
                    presence_penalty=data.get("presence_penalty", 0.0),
                    frequency_penalty=data.get("frequency_penalty", 0.0),
                    penalize_newline=data.get("penalize_newline", False),
                    stop=data.get("stop", []),
                    user=data["user"],
                )
                for data in data_list
            ]
            return Agent.objects.bulk_create(agents)
        except Exception as e:
            self.logger.error(f"Error bulk creating agents: {str(e)}")
            raise

    @transaction.atomic
    def bulk_update(self, data_list: List[dict]) -> List[Agent]:
        try:
            updated_agents = []
            for data in data_list:
                if agent_id := data.get("id"):
                    if updated_agent := self.update(agent_id, data):
                        updated_agents.append(updated_agent)
            return updated_agents
        except Exception as e:
            self.logger.error(f"Error bulk updating agents: {str(e)}")
            raise

    # Additional helper methods
    def get_user_agents(self, user_id: int) -> List[Agent]:
        """Get all agents for a specific user"""
        return self.list({"user_id": user_id})

    def get_active_agents(self) -> List[Agent]:
        """Get all active agents"""
        return self.list({"is_active": True})
