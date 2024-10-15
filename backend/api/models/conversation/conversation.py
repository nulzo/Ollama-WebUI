import uuid
from django.db import models
from api.models.users.user import CustomUser


class Conversation(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    is_pinned = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)
    name = models.CharField(blank=True, null=True, default="", max_length=150)
    user = models.ForeignKey(CustomUser, on_delete=models.PROTECT, related_name="conversations")

    def __str__(self) -> str:
        return str(f"({self.created_at.date()}) {self.name}")
