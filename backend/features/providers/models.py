from django.core.exceptions import ValidationError
from django.db import models
from features.authentication.models import CustomUser
from api.models.base import BaseModel


class Model(BaseModel):
    PROVIDER_CHOICES = [
        ("ollama", "Ollama"),
        ("openai", "OpenAI"),
        ("anthropic", "Anthropic"),
        ("azure", "Azure OpenAI"),
    ]

    REQUIRED_CAPABILITIES = {
        "openai": {"chat", "embeddings"},
        "anthropic": {"chat"},
        "ollama": {"chat", "embeddings"},
        "azure": {"chat", "embeddings"},
    }

    name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=100)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    capabilities = models.JSONField(default=dict)
    enabled = models.BooleanField(default=True)

    def clean(self):
        super().clean()
        self._validate_capabilities()
        self._validate_parameters()

    def _validate_capabilities(self):
        required_caps = self.REQUIRED_CAPABILITIES.get(self.provider, set())
        current_caps = set(self.capabilities.keys())

        if not required_caps.issubset(current_caps):
            missing = required_caps - current_caps
            raise ValidationError(f"Missing required capabilities for {self.provider}: {missing}")

    def _validate_parameters(self):
        if not isinstance(self.default_parameters, dict):
            raise ValidationError("Default parameters must be a dictionary")

    class Meta:
        unique_together = ("name", "provider")


class ProviderSettings(BaseModel):
    PROVIDER_CHOICES = [
        ("ollama", "Ollama"),
        ("openai", "OpenAI"),
        ("anthropic", "Anthropic"),
        ("azure", "Azure OpenAI"),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="provider_settings")
    provider_type = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    api_key = models.CharField(
        max_length=255, null=True, blank=True, help_text="API key for the provider (if required)"
    )
    endpoint = models.CharField(
        max_length=255, null=True, blank=True, help_text="Custom endpoint URL (if required)"
    )
    organization_id = models.CharField(
        max_length=255, null=True, blank=True, help_text="Organization ID (if required)"
    )
    is_enabled = models.BooleanField(
        default=True, help_text="Whether this provider is enabled for the user"
    )

    class Meta:
        unique_together = ["user", "provider_type"]
        verbose_name = "Provider Setting"
        verbose_name_plural = "Provider Settings"

    def __str__(self):
        return f"{self.user.username} - {self.provider_type}"

