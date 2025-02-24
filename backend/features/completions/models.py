import logging
from django.core.exceptions import ValidationError
import os
from django.db import models
from features.authentication.models import CustomUser
from api.models.base import BaseManager, BaseModel

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
        "conversations.Conversation", on_delete=models.CASCADE, related_name="messages", null=True, blank=True
    )
    role = models.CharField(max_length=25, choices=ROLE_CHOICES, db_index=True)
    content = models.TextField()
    user = models.ForeignKey("authentication.CustomUser", on_delete=models.CASCADE, null=True, blank=True)
    has_images = models.BooleanField(default=False)
    model = models.CharField(max_length=120, help_text="The model provider ref ID name")
    provider = models.CharField(max_length=120, null=True, blank=True)
    name = models.CharField(max_length=120, null=True, blank=True, help_text="The name of the model")
    is_liked = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)
    tokens_used = models.IntegerField(null=True, blank=True)
    generation_time = models.FloatField(null=True, blank=True)
    prompt_tokens = models.IntegerField(null=True, blank=True)
    completion_tokens = models.IntegerField(null=True, blank=True)
    finish_reason = models.CharField(max_length=50, null=True, blank=True)
    is_error = models.BooleanField(default=False)

    def clean(self):
        if self.role == "user" and not self.user:
            raise ValidationError("User messages must have a user")
        if self.role == "assistant" and not self.model:
            raise ValidationError("Assistant messages must have a model")

    def save(self, *args, **kwargs):
        self.full_clean()
        if self.role == 'user':
            self.tokens_used = None
            self.generation_time = None
            self.prompt_tokens = None
            self.completion_tokens = None
            self.finish_reason = None
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.role}: {self.content[:15]}"

    class Meta:
        indexes = [
            models.Index(fields=["created_at", "role"]),
            models.Index(fields=["conversation", "created_at"]),
        ]
        ordering = ["-created_at"]


class MessageImage(BaseModel):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="message_images")
    image = models.FileField(
        upload_to="message_images/%Y/%m/%d/",
    )
    order = models.IntegerField(default=0)

    def clean(self):
        if not self.message.has_images:
            self.message.has_images = True
            self.message.save(update_fields=["has_images"])

    def delete(self, *args, **kwargs):
        # Clean up file when model is deleted
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)

    def _delete_file(self):
        if self.image and os.path.isfile(self.image.path):
            os.remove(self.image.path)

    class Meta:
        ordering = ["order"]


class MessageError(BaseModel):
    message = models.OneToOneField(
        Message, 
        on_delete=models.CASCADE, 
        related_name="error_detail"
    )
    error_code = models.CharField(max_length=100, null=True, blank=True)
    error_title = models.CharField(max_length=255)
    error_description = models.TextField()

    def __str__(self):
        return f"{self.error_title} (Code: {self.error_code})"

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["created_at"]),
        ]
