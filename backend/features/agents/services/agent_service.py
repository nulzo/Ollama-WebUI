from typing import Dict, List
from django.core.exceptions import ValidationError
from api.utils.exceptions.exceptions import NotFoundException
from features.agents.models import Agent, AgentProvider, AgentModel
from features.agents.repositories.agent_repository import AgentRepository
from features.providers.clients.provider_factory import provider_factory
from features.providers.services.provider_settings_service import ProviderSettingsService


class AgentService:
    def __init__(self):
        self.repository = AgentRepository()
        self.provider_settings_service = ProviderSettingsService()
        self.provider_factory = provider_factory

    def create_agent(self, data: Dict) -> Agent:
        """Create a new agent"""
        try:
            return self.repository.create(data)
        except Exception as e:
            raise ValidationError(f"Error creating agent: {str(e)}")
        
    def get_agent(self, agent_id: int) -> Agent:
        return self.repository.get_by_id(agent_id)

    def list_agents(self, user_id: int) -> List[Agent]:
        return self.repository.get_user_agents(user_id)

    def update_agent(self, agent_id: int, data: Dict) -> Agent:
        agent = self.get_agent(agent_id)
        return self.repository.update(agent, data)

    def delete_agent(self, agent_id: int) -> bool:
        agent = self.get_agent(agent_id)
        return self.repository.delete(agent)
    
    def get_agent_by_uuid(self, uuid: str) -> Agent:
        agent = self.repository.get_by_uuid(uuid)
        if not agent:
            raise NotFoundException(f"Agent with UUID {uuid} not found")
        return agent

    def delete_agent_by_uuid(self, uuid: str) -> bool:
        agent = self.repository.get_by_uuid(uuid)
        if not agent:
            raise NotFoundException(f"Agent with UUID {uuid} not found")
        return self.repository.delete(agent.id)
