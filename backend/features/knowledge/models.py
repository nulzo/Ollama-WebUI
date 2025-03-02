from django.db import models

from features.authentication.models import CustomUser
from api.models.base import BaseModel


class Knowledge(BaseModel):
    name = models.CharField(max_length=255)
    identifier = models.CharField(max_length=255, unique=True)
    content = models.TextField()
    embedding = models.JSONField(null=True, blank=True)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="knowledge_documents"
    )
    # File-related fields
    file_path = models.CharField(max_length=255, null=True, blank=True)
    file_size = models.IntegerField(null=True, blank=True)
    file_type = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("processing", "Processing"),
            ("ready", "Ready"),
            ("error", "Error"),
        ],
        default="ready",
    )
    error_message = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Knowledge"
        indexes = [
            models.Index(fields=["identifier"]),
            models.Index(fields=["user", "created_at"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.identifier})"
