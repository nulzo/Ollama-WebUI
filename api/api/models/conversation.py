from django.db import models
from api.models.user import UserSettings

class Conversation(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(UserSettings, on_delete=models.CASCADE)
    is_pinned = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)
    timestamp_updated = models.DateTimeField(auto_now=True)
    model = models.CharField(max_length=150)
    uuid = models.CharField(max_length=100, blank=False, null=False, unique=True, primary_key=True)
    name = models.CharField(blank=True, null=True, default='', max_length=150)

    def __str__(self) -> str:
        return str(f"({self.created_at.date()}) {self.name}")
