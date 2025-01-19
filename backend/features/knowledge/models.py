from django.db import models

from api.models.auth.user import CustomUser
from api.models.base import BaseModel


class Knowledge(BaseModel):
    name = models.CharField(max_length=255)
    identifier = models.CharField(max_length=255, unique=True)
    content = models.TextField()
    embedding = models.JSONField(null=True, blank=True)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="knowledge_documents"
    )

    class Meta:
        verbose_name_plural = "Knowledge"
        indexes = [
            models.Index(fields=["identifier"]),
            models.Index(fields=["user", "created_at"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.identifier})"
