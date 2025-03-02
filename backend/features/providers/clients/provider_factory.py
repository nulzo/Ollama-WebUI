import logging
from typing import Dict, Optional, Any, TypeVar, Union

from features.analytics.services.analytics_service import AnalyticsEventService
from .base_provider import BaseProvider
from ..registry import provider_registry
from api.utils.exceptions import ServiceError
from features.providers.repositories.provider_settings_repository import ProviderSettingsRepository

# Type variable for provider types
T = TypeVar('T', bound=BaseProvider)

class ProviderFactory:
    def __init__(self, analytics_service: Optional[AnalyticsEventService] = None):
        self.logger = logging.getLogger(__name__)
        self.analytics_service = analytics_service or AnalyticsEventService()
        # Cache provider instances keyed by provider and user
        self._provider_instances: Dict[str, BaseProvider] = {}
        self.provider_settings_repo = ProviderSettingsRepository()

    def _fetch_config_for_user(self, provider_name: str, user_id: int) -> Dict[str, Any]:
        settings_instance = self.provider_settings_repo.get_by_user_and_provider(user_id, provider_name)
        self.logger.info(f"Settings instance: {settings_instance}")
        
        if settings_instance:
            return {
                "api_key": settings_instance.api_key,
                "endpoint": settings_instance.endpoint,
                "organization_id": settings_instance.organization_id,
                "is_enabled": settings_instance.is_enabled,
            }
        # Return an empty config (or defaults) if the user's settings do not exist.
        return {}

    def get_provider(self, provider_name: str, config_or_user: Union[Dict[str, Any], int]) -> BaseProvider:
        if not isinstance(config_or_user, dict):
            config = self._fetch_config_for_user(provider_name, config_or_user)
        else:
            config = config_or_user
        try:
            provider_class = provider_registry.get_provider_class(provider_name)
            instance = provider_class(config)
            return instance
        except Exception as e:
            raise ServiceError(f"Provider {provider_name} initialization failed: {e}")

    def update_provider_config(self, provider_name: str, user_id: int, config: Dict[str, Any]) -> None:
        # Use only the user_id to fetch the provider instance.
        provider = self.get_provider(provider_name, user_id)
        try:
            provider.update_config(config)
            self.logger.info(f"Updated configuration for provider {provider_name} (user: {user_id})")
        except Exception as e:
            self.logger.error(f"Error updating provider config: {e}")
            raise ServiceError(f"Failed to update provider config: {e}")

provider_factory = ProviderFactory()