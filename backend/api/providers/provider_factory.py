from typing import Dict, Type
from api.utils.exceptions import ServiceError
from api.providers.base_provider import BaseProvider
from api.providers.openai_provider import OpenAiProvider
from api.providers.ollama_provider import OllamaProvider
from api.models.providers.provider import ProviderSettings
import logging

from api.utils.exceptions.exceptions import ProviderException


class ProviderFactory:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
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
            
            return self._providers[key]

        except Exception as e:
            self.logger.error(f"Error creating provider {provider_name}: {str(e)}")
            raise ServiceError(f"Failed to create provider: {str(e)}")

    def update_provider_config(self, provider_name: str, user_id: int, config: Dict):
        """
        Update the configuration for a specific provider instance.
        """
        provider = self.get_provider(provider_name, user_id)
        provider.update_config(config)


# Create a singleton instance
provider_factory = ProviderFactory()
