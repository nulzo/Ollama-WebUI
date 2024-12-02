from rest_framework import serializers
from api.models.providers.provider import ProviderSettings

class ProviderSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderSettings
        fields = ['id', 'provider_type', 'api_key', 'endpoint', 'organization_id', 'is_enabled']
        read_only_fields = ['id']