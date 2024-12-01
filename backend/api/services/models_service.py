import logging
from typing import Dict, List
from api.providers.provider_factory import provider_factory
from api.utils.exceptions import ServiceError

logger = logging.getLogger(__name__)

class ModelsService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def get_provider_models(self, user_id: int, provider_type: str = None) -> Dict[str, List[str]]:
        """
        Get available models for specified provider(s)
        
        Args:
            user_id: The ID of the user requesting models
            provider_type: Optional provider type to filter results
            
        Returns:
            Dict of provider names and their available models
        """
        try:
            models = {}
            providers = ["ollama", "openai"] if not provider_type else [provider_type]
            
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