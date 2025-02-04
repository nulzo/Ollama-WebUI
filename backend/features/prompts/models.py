from django.db import models
from features.authentication.models import CustomUser
from api.models.base import BaseModel


class CustomPrompt(BaseModel):
    title = models.CharField(max_length=255)
    command = models.CharField(max_length=100, unique=True)
    content = models.TextField()
    description = models.TextField(blank=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="custom_prompts")

    class Meta:
        verbose_name_plural = "Custom Prompts"
        indexes = [
            models.Index(fields=["command"]),
            models.Index(fields=["user", "created_at"]),
        ]
        unique_together = ["command", "user"]

    def __str__(self):
        return f"{self.title} ({self.command})"
