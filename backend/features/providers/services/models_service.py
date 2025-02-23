import logging
from typing import Dict, List

from features.providers.clients.provider_factory import provider_factory
from api.utils.exceptions import ServiceError

logger = logging.getLogger(__name__)


class ModelsService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def get_provider_models(self, user_id: int, provider_type: str = None) -> Dict[str, List[str]]:
        """
        Get available models for specified provider(s).

        Args:
            user_id: The ID of the user requesting models.
            provider_type: Optional provider type to filter results. When not provided,
                           the models for all supported providers will be returned.

        Returns:
            Dict mapping each provider name to its available models.
        """
        try:
            models = {}
            # If a specific provider type is provided, limit to that provider; otherwise, query all.
            if provider_type:
                providers = [provider_type]
            else:
                providers = ["ollama", "openai", "google", "anthropic"]

            for provider_name in providers:
                try:
                    provider = provider_factory.get_provider(provider_name, user_id)
                    provider_models = provider.models()
                    models[provider_name] = provider_models
                except Exception as e:
                    self.logger.warning(f"Failed to fetch models for {provider_name}: {str(e)}")
                    models[provider_name] = []

            return models

        except Exception as e:
            self.logger.error(f"Error fetching provider models: {str(e)}")
            raise ServiceError(f"Failed to fetch provider models: {str(e)}")