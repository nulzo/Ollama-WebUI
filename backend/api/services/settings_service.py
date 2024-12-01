from django.db import IntegrityError
from api.models.providers.provider import ProviderSettings
from api.serializers.provider_settings_serializer import ProviderSettingsSerializer
from api.providers.provider_factory import provider_factory
from api.utils.exceptions import ServiceError, ValidationError
import logging

logger = logging.getLogger(__name__)

class ProviderSettingsService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def get_user_settings_queryset(self, user):
        """Get queryset of provider settings for a user"""
        return ProviderSettings.objects.filter(user=user)

    def create_settings(self, user, data):
        """Create new provider settings"""
        try:
            serializer = ProviderSettingsSerializer(data=data)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            instance = serializer.save(user=user)
            self._update_provider_config(instance)
            
            return serializer.data

        except IntegrityError as e:
            self.logger.error(f"Database integrity error: {str(e)}")
            raise ValidationError("Provider settings already exist for this user")
        except Exception as e:
            self.logger.error(f"Error creating provider settings: {str(e)}")
            raise ServiceError(f"Failed to create provider settings: {str(e)}")

    def update_settings(self, user, provider_id, data):
        """Update provider settings"""
        try:
            instance = ProviderSettings.objects.get(id=provider_id, user=user)
            serializer = ProviderSettingsSerializer(
                instance,
                data=data,
                partial=True
            )
            
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
                },
            )
        except Exception as e:
            self.logger.error(f"Error updating provider config: {str(e)}")
            raise ServiceError(f"Failed to update provider config: {str(e)}")