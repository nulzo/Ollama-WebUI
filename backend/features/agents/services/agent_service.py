from typing import Dict, List
from django.core.exceptions import ValidationError
from features.agents.models import Agent, AgentProvider, AgentModel
from features.agents.repositories.agent_repository import AgentRepository
from features.providers.clients.provider_factory import ProviderFactory
from features.providers.services.provider_settings_service import ProviderSettingsService


class AgentService:
    def __init__(self):
        self.repository = AgentRepository()
        self.provider_settings_service = ProviderSettingsService()
        self.provider_factory = ProviderFactory()

    def create_agent(self, data: Dict) -> Agent:
        # Validate provider and model
        provider = AgentProvider.objects.get(id=data["provider_id"])
        model = AgentModel.objects.get(id=data["model_id"])

        # Get provider settings
        settings = self.provider_settings_service.get_provider_settings(
            data["user"].id, provider.name
        )

        # Get provider implementation
        provider_impl = self.provider_factory.create_provider(settings)

        # Validate parameters
        if not provider_impl.validate_model_parameters(model.name, data.get("parameters", {})):
            raise ValidationError("Invalid parameters for selected model")

        # Create agent
        return self.repository.create(
            {
                "display_name": data["display_name"],
                "description": data.get("description"),
                "icon": data.get("icon"),
                "provider": provider,
                "model": model,
                "system_prompt": data.get("system_prompt"),
                "parameters": data.get("parameters", {}),
                "enabled": data.get("enabled", True),
                "user": data["user"],
            }
        )

    def get_agent(self, agent_id: int) -> Agent:
        return self.repository.get_by_id(agent_id)

    def list_agents(self, user_id: int) -> List[Agent]:
        return self.repository.get_by_user(user_id)

    def update_agent(self, agent_id: int, data: Dict) -> Agent:
        agent = self.get_agent(agent_id)
        return self.repository.update(agent, data)

    def delete_agent(self, agent_id: int) -> bool:
        agent = self.get_agent(agent_id)
        return self.repository.delete(agent)
