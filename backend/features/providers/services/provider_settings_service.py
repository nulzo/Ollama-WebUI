from typing import List, Dict
import logging
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from features.authentication.models import CustomUser
from features.providers.repositories.provider_settings_repository import ProviderSettingsRepository
from features.providers.models import  ProviderSettings
from api.utils.exceptions import NotFoundException, ServiceError
from features.providers.clients.provider_factory import provider_factory
from features.providers.serializers.provider_settings_serializer import ProviderSettingsSerializer


class ProviderSettingsService:
    def __init__(self):
        self.repository = ProviderSettingsRepository()
        self.provider_factory = provider_factory
        self.logger = logging.getLogger(__name__)

    def get_user_settings(self, user_id: int) -> List[Dict]:
        """Get all provider settings for a user"""
        try:
            settings = self.repository.get_by_user(user_id)
            return [self._sanitize_settings(s) for s in settings]
        except Exception as e:
            self.logger.error(f"Error fetching user settings: {str(e)}")
            raise ServiceError("Failed to fetch provider settings")

    def get_provider_settings(self, user_id: int, provider_type: str) -> Dict:
        """Get settings for a specific provider"""
        settings = self.repository.get_by_user_and_provider(user_id, provider_type)
        if not settings:
            raise NotFoundException(f"Settings not found for provider {provider_type}")
        return self._sanitize_settings(settings)

    def create_settings(self, user: CustomUser, data: dict) -> dict:
        """Create provider settings."""
        try:
            provider_type = data.get("provider_type")
            if not provider_type:
                raise ValidationError({"provider_type": ["Provider type is required"]})

            # Validate required fields based on provider type
            self.validate_provider_settings(provider_type, data)

            # Create settings
            settings = ProviderSettings.objects.create(
                user=user,
                provider_type=provider_type,
                api_key=data.get("api_key"),
                host=data.get("host"),
                organization_id=data.get("organization_id"),
                is_enabled=data.get("is_enabled", False)
            )
            
            return self.serialize_settings(settings)
        except Exception as e:
            self.logger.error(f"Failed to create provider settings: {str(e)}")
            raise ServiceError(f"Failed to create provider settings: {str(e)}")

    def update_settings(self, user_id: int, provider_type: str, data: dict) -> Dict:
        """Update provider settings"""
        try:
            # Get existing settings
            settings = self.repository.get_by_user_and_provider(user_id, provider_type)
            if not settings:
                raise NotFoundException("Provider settings not found")

            # Validate data
            serializer = ProviderSettingsSerializer(settings, data=data, partial=True)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            # Update settings
            settings = self.repository.update(settings, serializer.validated_data)

            # Update provider configuration
            self._update_provider_config(settings)

            return self._sanitize_settings(settings)

        except ValidationError:
            raise
        except Exception as e:
            self.logger.error(f"Error updating provider settings: {str(e)}")
            raise ServiceError(f"Failed to update provider settings: {str(e)}")

    def delete_settings(self, user_id: int, provider_type: str) -> bool:
        """Delete provider settings"""
        settings = self.repository.get_by_user_and_provider(user_id, provider_type)
        if not settings:
            raise NotFoundException(f"Settings not found for provider {provider_type}")
        return self.repository.delete(settings)

    def create_default_settings(self, user_id: int) -> List[Dict]:
        """Create default provider settings for a new user"""
        default_providers = [
            {"provider_type": "ollama", "is_enabled": True, "endpoint": "http://localhost:11434"},
            {"provider_type": "openai", "is_enabled": False},
            {"provider_type": "anthropic", "is_enabled": False},
            {"provider_type": "azure", "is_enabled": False},
        ]

        settings = []
        for provider in default_providers:
            setting = self.repository.create({**provider, "user_id": user_id})
            settings.append(self._sanitize_settings(setting))

        return settings

    def _update_provider_config(self, settings: ProviderSettings) -> None:
        """Update the provider configuration in the factory"""
        try:
            self.provider_factory.update_provider_config(
                settings.provider_type,
                settings.user_id,
                {
                    "api_key": settings.api_key,
                    "endpoint": settings.endpoint,
                    "organization_id": settings.organization_id,
                },
            )
        except Exception as e:
            self.logger.error(f"Error updating provider config: {str(e)}")
            raise ServiceError(f"Failed to update provider config: {str(e)}")

    def _sanitize_settings(self, settings: ProviderSettings) -> Dict:
        """Convert settings to safe dictionary format"""
        return {
            "id": settings.id,
            "provider_type": settings.provider_type,
            "endpoint": settings.endpoint,
            "organization_id": settings.organization_id,
            "is_enabled": settings.is_enabled,
            "has_api_key": bool(settings.api_key),
            "created_at": settings.created_at,
            "updated_at": settings.updated_at,
        }

    def get_settings(self, user):
        return ProviderSettings.objects.filter(user=user)
    
    def get_setting(self, user, provider_id):
        return ProviderSettings.objects.get(user=user, id=provider_id)