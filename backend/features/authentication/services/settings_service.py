import logging

from django.db import IntegrityError

from features.providers.models import ProviderSettings
from features.providers.clients.provider_factory import provider_factory
from features.providers.serializers.provider_settings_serializer import ProviderSettingsSerializer
from api.utils.exceptions import ServiceError, ValidationError

logger = logging.getLogger(__name__)


class ProviderSettingsService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def get_user_settings_queryset(self, user):
        """Get queryset of provider settings for a user"""
        return ProviderSettings.objects.filter(user=user)

    def create_settings(self, user, data):
        """Create or update provider settings"""
        try:
            provider_type = data.get('provider_type')
            existing_settings = ProviderSettings.objects.filter(
                user=user,
                provider_type=provider_type
            ).first()

            if existing_settings:
                serializer = ProviderSettingsSerializer(
                    existing_settings,
                    data=data,
                    partial=True
                )
            else:
                serializer = ProviderSettingsSerializer(data=data)

            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            instance = serializer.save(user=user)
            self._update_provider_config(instance)

            return serializer.data

        except ValidationError:
            raise
        except Exception as e:
            self.logger.error(f"Error creating/updating provider settings: {str(e)}")
            raise ServiceError(f"Failed to create/update provider settings: {str(e)}")

    def update_settings(self, user, provider_id, data):
        """Update provider settings"""
        try:
            instance = ProviderSettings.objects.get(id=provider_id, user=user)
            serializer = ProviderSettingsSerializer(instance, data=data, partial=True)

            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            instance = serializer.save()
            self._update_provider_config(instance)

            return serializer.data

        except ProviderSettings.DoesNotExist:
            raise ValidationError("Provider settings not found")
        except Exception as e:
            self.logger.error(f"Error updating provider settings: {str(e)}")
            raise ServiceError(f"Failed to update provider settings: {str(e)}")

    def _update_provider_config(self, instance):
        """Update the provider configuration in the factory"""
        try:
            provider_factory.update_provider_config(
                instance.provider_type,
                instance.user.id,
                {
                    "api_key": instance.api_key,
                    "endpoint": instance.endpoint,
                    "organization_id": instance.organization_id,
                    "is_enabled": instance.is_enabled,
                },
            )
        except Exception as e:
            self.logger.error(f"Error updating provider config: {str(e)}")
            raise ServiceError(f"Failed to update provider config: {str(e)}")
