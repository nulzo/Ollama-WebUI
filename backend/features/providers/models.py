from django.core.exceptions import ValidationError
from django.db import models
from features.authentication.models import CustomUser
from api.models.base import BaseModel
from django.contrib.auth import get_user_model


class ProviderSettings(BaseModel):
    PROVIDER_CHOICES = [
        ("ollama", "Ollama"),
        ("openai", "OpenAI"),
        ("anthropic", "Anthropic"),
        ("azure", "Azure OpenAI"),
        ("google", "Google"),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="provider_settings")
    provider_type = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    api_key = models.CharField(
        max_length=255, null=True, blank=True,
        help_text="API key for the provider (if required)"
    )
    endpoint = models.CharField(
        max_length=255, null=True, blank=True,
        help_text="Custom endpoint URL (if required)"
    )
    organization_id = models.CharField(
        max_length=255, null=True, blank=True,
        help_text="Organization ID (if required)"
    )
    is_enabled = models.BooleanField(
        default=False, help_text="Whether this provider is enabled for the user"
    )
    options = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ["user", "provider_type"]
        verbose_name = "Provider Setting"
        verbose_name_plural = "Provider Settings"

    def __str__(self):
        return f"{self.user.username} - {self.provider_type}"
