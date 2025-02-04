import logging
from typing import Dict, Type

from features.analytics.services.analytics_service import AnalyticsService
from features.providers.clients.base_provider import BaseProvider
from features.providers.clients.ollama_provider import OllamaProvider
from features.providers.clients.openai_provider import OpenAiProvider
from api.utils.exceptions import ServiceError
from api.utils.exceptions.exceptions import ProviderException


class ProviderFactory:
    def __init__(self, analytics_service: AnalyticsService = None):
        self.logger = logging.getLogger(__name__)
        self.analytics_service = analytics_service or AnalyticsService()
        self._providers: Dict[str, Dict[int, BaseProvider]] = (
            {}
        )  # Nested dict for user-specific providers
        self._provider_classes: Dict[str, Type[BaseProvider]] = {
            "openai": OpenAiProvider,
            "ollama": OllamaProvider,
        }

    def get_provider(self, provider_name: str, user_id: int) -> BaseProvider:
        """
        Get or create a provider instance by name for a specific user.

        Args:
            provider_name: Name of the provider ('openai' or 'ollama')
            user_id: ID of the user requesting the provider

        Returns:
            BaseProvider: Instance of the requested provider

        Raises:
            ServiceError: If provider name is invalid
        """
        try:
            key = f"{provider_name}_{user_id}" if user_id else provider_name

            if key not in self._providers:
                if provider_name not in self._provider_classes:
                    raise ProviderException(f"Unknown provider: {provider_name}")

                provider_class = self._provider_classes[provider_name]
                self._providers[key] = provider_class()
                self._providers[key].analytics_service = self.analytics_service

            return self._providers[key]

        except Exception as e:
            self.logger.error(f"Error creating provider {provider_name}: {str(e)}")
            raise ServiceError(f"Failed to create provider: {str(e)}")

    def update_provider_config(self, provider_name: str, user_id: int, config: Dict):
        """Update the configuration for a specific provider instance"""
        try:
            provider = self.get_provider(provider_name, user_id)
            provider.update_config(config)
            self.logger.info(f"Updated config for provider {provider_name} (user: {user_id})")
        except Exception as e:
            self.logger.error(f"Error updating provider config: {str(e)}")
            raise ServiceError(f"Failed to update provider config: {str(e)}")


# Create a singleton instance
provider_factory = ProviderFactory(AnalyticsService())
