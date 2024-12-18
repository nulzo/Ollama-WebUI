from rest_framework import serializers
from api.models.providers.provider_settings import ProviderSettings


class ProviderSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderSettings
        fields = [
            "id",
            "provider_type",
            "api_key",
            "endpoint",
            "organization_id",
            "is_enabled",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {"api_key": {"write_only": True}}

    def validate(self, data):
        provider_type = data.get("provider_type")
        if provider_type == "ollama" and not data.get("endpoint"):
            raise serializers.ValidationError(
                {"endpoint": "Endpoint is required for Ollama provider"}
            )
        elif provider_type in ["openai", "anthropic"] and not data.get("api_key"):
            raise serializers.ValidationError(
                {"api_key": f"API key is required for {provider_type} provider"}
            )
        return data
