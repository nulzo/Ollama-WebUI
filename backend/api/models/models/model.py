from django.db import models


class Model(models.Model):
    name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=100)
    provider = models.CharField(
        max_length=20,
        choices=[
            ('ollama', 'Ollama'),
            ('openai', 'OpenAI')
        ],
    )
    description = models.TextField(null=True, blank=True)
    enabled = models.BooleanField(default=True)
    capabilities = models.JSONField(default=dict)
    default_parameters = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'provider')
