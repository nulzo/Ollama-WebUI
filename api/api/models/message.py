from django.db import models
from api.models.conversation import Conversation


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=25, blank=False, null=False)
    is_liked = models.BooleanField(default=False)

    def __str__(self) -> str:
        return str(f"{self.role}: {self.content}")
