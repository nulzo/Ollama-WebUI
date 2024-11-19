from typing import Dict, Type
from api.utils.exceptions import ServiceError
from api.providers.base_provider import BaseProvider
from api.providers.openai_provider import OpenAiProvider
from api.providers.ollama_provider import OllamaProvider
import logging


class ProviderFactory:
    """
    Factory class for creating LLM providers.
    Manages the creation and caching of provider instances.
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self._providers: Dict[str, BaseProvider] = {}
        self._provider_classes: Dict[str, Type[BaseProvider]] = {
            'openai': OpenAiProvider,
            'ollama': OllamaProvider
        }

    def get_provider(self, provider_name: str) -> BaseProvider:
        """
        Get or create a provider instance by name.

        Args:
            provider_name: Name of the provider ('openai' or 'ollama')

        Returns:
            BaseProvider: Instance of the requested provider

        Raises:
            ServiceError: If provider name is invalid
        """
        try:
            # Return cached provider if it exists
            if provider_name in self._providers:
                return self._providers[provider_name]

            # Get provider class
            if provider_name not in self._provider_classes:
                raise ServiceError(f"Unknown provider: {provider_name}")

            # Create new provider instance
            provider_class = self._provider_classes[provider_name]
            provider = provider_class()

            # Cache the provider
            self._providers[provider_name] = provider

            self.logger.info(f"Created new {provider_name} provider")
            return provider

        except Exception as e:
            self.logger.error(f"Error creating provider {provider_name}: {str(e)}")
            raise ServiceError(f"Failed to create provider: {str(e)}")

    def register_provider(self, name: str, provider_class: Type[BaseProvider]):
        """
        Register a new provider class.

        Args:
            name: Name for the provider
            provider_class: The provider class to register
        """
        self._provider_classes[name] = provider_class
        self.logger.info(f"Registered new provider class: {name}")