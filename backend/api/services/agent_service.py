import logging

from api.repositories.agent_repository import AgentRepository
from api.utils.exceptions import NotFoundException


class AgentService:
    def __init__(self):
        self.repository = AgentRepository()
        self.logger = logging.getLogger(__name__)

    def create_agent(self, data: dict):
        """Create a new agent"""
        return self.repository.create(data)

    def get_agent(self, agent_id: int):
        """Get agent by ID"""
        agent = self.repository.get_by_id(agent_id)
        if not agent:
            raise NotFoundException("Agent not found")
        return agent

    def list_agents(self, user_id: int = None):
        """List agents"""
        filters = {"enabled": True}
        if user_id:
            filters["user_id"] = user_id
        return self.repository.list(filters)

    def update_agent(self, agent_id: int, data: dict):
        """Update agent"""
        agent = self.get_agent(agent_id)
        return self.repository.update(agent.id, data)

    def delete_agent(self, agent_id: int):
        """Delete agent"""
        agent = self.get_agent(agent_id)
        return self.repository.delete(agent.id)
