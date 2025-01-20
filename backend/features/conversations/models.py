import uuid

from django.db import models
from django.db.models import Count, Prefetch, Q
from features.authentication.models import CustomUser
from features.completions.models import Message


class ConversationManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().select_related("user")

    def with_messages(self, limit: int = 50):
        """Get conversations with their most recent messages"""
        return self.get_queryset().prefetch_related(
            Prefetch("messages", queryset=Message.objects.order_by("-created_at")[:limit])
        )

    def with_message_count(self):
        """Add message count to conversations"""
        return self.get_queryset().annotate(
            message_count=Count("messages"),
            unread_count=Count("messages", filter=Q(messages__read=False)),
        )


class Conversation(models.Model):
    uuid = models.UUIDField(
        default=uuid.uuid4, editable=False, unique=True, primary_key=True, db_index=True
    )
    user = models.ForeignKey("authentication.CustomUser", on_delete=models.CASCADE, related_name="conversations")
    name = models.CharField(max_length=150, blank=True, null=True, default="")
    is_pinned = models.BooleanField(default=False, db_index=True)
    is_hidden = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = ConversationManager()

    class Meta:
        indexes = [
            models.Index(
                fields=["user_id", "deleted_at", "-updated_at"],
                name="conv_user_deleted_updated_idx",
            )
        ]
