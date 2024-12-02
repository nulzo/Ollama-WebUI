from django.db import models
from django.core.exceptions import ValidationError
from api.models.base import BaseModel

class Model(BaseModel):
    PROVIDER_CHOICES = [
        ('ollama', 'Ollama'),
        ('openai', 'OpenAI'),
        ('anthropic', 'Anthropic'),
        ('azure', 'Azure OpenAI'),
    ]

    REQUIRED_CAPABILITIES = {
        'openai': {'chat', 'embeddings'},
        'anthropic': {'chat'},
        'ollama': {'chat', 'embeddings'},
        'azure': {'chat', 'embeddings'},
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
            raise ValidationError(
                f"Missing required capabilities for {self.provider}: {missing}"
            )

    def _validate_parameters(self):
        if not isinstance(self.default_parameters, dict):
            raise ValidationError("Default parameters must be a dictionary")

    class Meta:
        unique_together = ('name', 'provider')
