from django.db import models
from api.models.chat.assistant import Assistant
from api.models.auth.user import CustomUser
from api.models.base import BaseModel, BaseManager
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)


class MessageManager(BaseManager):
    def get_related_fields(self):
        return ["conversation", "model", "user"]

    def with_interactions(self):
        return self.get_queryset().prefetch_related(
            "liked_by", "pinned_by", "deleted_by", "message_images"
        )


class Message(BaseModel):
    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
        ("system", "System"),
    ]
    conversation = models.ForeignKey(
        "api.Conversation", on_delete=models.CASCADE, related_name="messages", null=True, blank=True
    )
    role = models.CharField(max_length=25, choices=ROLE_CHOICES, db_index=True)
    content = models.TextField()
    model = models.ForeignKey(Assistant, on_delete=models.PROTECT, null=True, blank=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    has_images = models.BooleanField(default=False)

    def clean(self):
        if self.role == "user" and not self.user:
            raise ValidationError("User messages must have a user")
        if self.role == "assistant" and not self.model:
            raise ValidationError("Assistant messages must have a model")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.role}: {self.content[:15]}"

    class Meta:
        indexes = [
            models.Index(fields=["created_at", "role"]),
            models.Index(fields=["conversation", "created_at"]),
        ]
        ordering = ["-created_at"]
