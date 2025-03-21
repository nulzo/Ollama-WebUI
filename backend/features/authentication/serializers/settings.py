from rest_framework import serializers

from features.authentication.models import Settings
from features.providers.serializers.provider_settings_serializer import ProviderSettingsSerializer


class SettingsSerializer(serializers.ModelSerializer):
    providers = ProviderSettingsSerializer(many=True, read_only=True, source="providersettings_set")

    class Meta:
        model = Settings
        fields = ["id", "theme", "default_model", "providers", "inline_citations_enabled", "prompt_settings"]
        read_only_fields = ["id"]
