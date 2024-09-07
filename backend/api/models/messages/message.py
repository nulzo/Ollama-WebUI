from django.db import models
from api.models.conversation.conversation import Conversation
from api.models.sender.sender import Sender


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    meta_user = models.CharField(max_length=200, blank=True, null=True)
    meta_model = models.CharField(max_length=200, blank=True, null=True)
    role = models.CharField(max_length=25, blank=False, null=False)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    sender = models.ForeignKey(Sender, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self) -> str:
        return self.content[:15]
