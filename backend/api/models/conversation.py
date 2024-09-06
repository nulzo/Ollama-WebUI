from django.db import models
from api.models.user import CustomUser

class Conversation(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    is_pinned = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    model = models.CharField(max_length=150, blank=True, null=True)
    uuid = models.CharField(max_length=100, blank=False, null=False, unique=True, primary_key=True)
    name = models.CharField(blank=True, null=True, default='', max_length=150)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='conversations')
    last_message_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return str(f"({self.created_at.date()}) {self.name}")
