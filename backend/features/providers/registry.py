import logging
from typing import Dict, Type
from features.providers.clients.base_provider import BaseProvider
from features.providers.clients.openai_provider import OpenAiProvider
from features.providers.clients.ollama_provider import OllamaProvider
from features.providers.clients.google_provider import GoogleProvider
from features.providers.clients.anthropic_provider import AnthropicProvider
from features.providers.clients.openrouter_provider import OpenRouterProvider



logger = logging.getLogger(__name__)

class ProviderRegistry:
    def __init__(self):
        self._providers: Dict[str, Type[BaseProvider]] = {}
        self.register_provider("openai", OpenAiProvider)
        self.register_provider("ollama", OllamaProvider)
        self.register_provider("google", GoogleProvider)
        self.register_provider("anthropic", AnthropicProvider)
        self.register_provider("openrouter", OpenRouterProvider)

    def register_provider(self, name: str, provider_class: Type[BaseProvider]):
        self._providers[name.lower()] = provider_class
        logger.info(f"Registered provider: {name}")

    def get_provider_class(self, name: str) -> Type[BaseProvider]:
        provider_class = self._providers.get(name.lower())
        if not provider_class:
            logger.error(f"Provider {name} not found in registry")
            raise ValueError(f"Provider '{name}' is not registered")
        return provider_class

    def is_provider_registered(self, name: str) -> bool:
        return name in self._providers

# Singleton instance of the registry
provider_registry = ProviderRegistry()