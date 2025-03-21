from django.db import models
from api.models.base import BaseModel


class AgentProvider(models.Model):
    """Provider configuration for agents"""

    name = models.CharField(max_length=50)  # e.g., 'ollama', 'openai'
    display_name = models.CharField(max_length=100)  # e.g., 'Ollama', 'OpenAI'
    is_enabled = models.BooleanField(default=True)
    requires_api_key = models.BooleanField(default=True)
    supports_streaming = models.BooleanField(default=True)
    supports_functions = models.BooleanField(default=True)
    supports_vision = models.BooleanField(default=False)
    default_parameters = models.JSONField(default=dict)

    class Meta:
        verbose_name_plural = "Agent Providers"


class AgentModel(models.Model):
    """Model configuration for each provider"""

    provider = models.ForeignKey(AgentProvider, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)  # e.g., 'gpt-4', 'llama2'
    display_name = models.CharField(max_length=100)
    capabilities = models.JSONField(default=dict)
    parameters = models.JSONField(default=dict)
    is_enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ["provider", "name"]


class Agent(BaseModel):
    """User-created agent instances"""
    display_name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    icon = models.TextField(null=True, blank=True)
    model = models.CharField(max_length=100)
    system_prompt = models.TextField(null=True, blank=True)
    parameters = models.JSONField(default=dict)
    user = models.ForeignKey("authentication.CustomUser", on_delete=models.CASCADE)

    class Meta:
        unique_together = ["user", "display_name"]
