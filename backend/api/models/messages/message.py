import json
from django.db import models
from api.models.conversation.conversation import Conversation
from api.models.assistant.assistant import Assistant
from api.models.users.user import CustomUser
import logging

logger = logging.getLogger(__name__)


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages", null=True, blank=True
    )
    role = models.CharField(max_length=25, blank=False, null=False)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    model = models.ForeignKey(Assistant, on_delete=models.PROTECT, null=True, blank=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    has_images = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.content[:15]
