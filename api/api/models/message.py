from django.db import models
from .chat import Chat


class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    time = models.DateTimeField(auto_now_add=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=25, blank=False, null=False)

    def __str__(self) -> str:
        return str(f"{self.role}: {self.content}")
