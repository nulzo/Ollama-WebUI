from django.db import models
from api.models.users.user import CustomUser
from api.models.messages.message import Message


class PinnedMessage(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="pinned_messages")
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="pinned_by")
    pinned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "message")

    def __str__(self):
        return f"{self.user.name} pinned {self.message.content[:15]}"
