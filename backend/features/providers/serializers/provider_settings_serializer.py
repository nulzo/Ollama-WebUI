from rest_framework import serializers
from features.providers.models import ProviderSettings

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
        # extra_kwargs = {"api_key": {"write_only": True}}

    def validate(self, data):
        # Get provider_type from new data if provided; otherwise, fallback to the instance.
        provider_type = data.get("provider_type", self.instance.provider_type if self.instance else None)

        if provider_type == "ollama":
            # When creating or if the request explicitly includes a value for endpoint,
            # validate that endpoint is provided.
            if not self.instance or "endpoint" in data:
                endpoint = data.get("endpoint", self.instance.endpoint if self.instance else None)
                if not endpoint:
                    raise serializers.ValidationError({
                        "endpoint": "Endpoint is required for Ollama provider"
                    })
        elif provider_type in ["openai", "anthropic", "google", "openrouter"]:
            # Check the is_enabled flag: only require API key if the provider is enabled.
            is_enabled = data.get("is_enabled", self.instance.is_enabled if self.instance else False)
            if is_enabled:
                if not self.instance or "api_key" in data:
                    api_key = data.get("api_key", self.instance.api_key if self.instance else None)
                    if not api_key:
                        raise serializers.ValidationError({
                            "api_key": f"API key is required for {provider_type} provider when enabled"
                        })
        return data