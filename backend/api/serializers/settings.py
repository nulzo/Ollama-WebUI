from rest_framework import serializers
from api.models.settings.settings import Settings
from api.serializers.provider_settings_serializer import ProviderSettingsSerializer


class SettingsSerializer(serializers.ModelSerializer):
    providers = ProviderSettingsSerializer(many=True, read_only=True, source="providersettings_set")

    class Meta:
        model = Settings
        fields = ["id", "theme", "default_model", "providers"]
        read_only_fields = ["id"]
