from django.db import models
from api.models.base import BaseModel

class EventTypeEnum(models.TextChoices):
    MESSAGE = "MESSAGE"
    EVENT = "EVENT"
    TOKEN = "TOKEN"
    MODEL = "MODEL"

class AnalyticsEvent(BaseModel):
    """Analytics events for tracking user activity"""
    user = models.ForeignKey("authentication.CustomUser", on_delete=models.CASCADE)
    event_type = models.CharField(max_length=50)
    model = models.CharField(max_length=100, null=True, blank=True)
    tokens = models.IntegerField(default=0, null=True, blank=True)
    prompt_tokens = models.IntegerField(default=0, null=True, blank=True)
    completion_tokens = models.IntegerField(default=0, null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=6, default=0, null=True, blank=True)
    metadata = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "analytics_events"
        indexes = [
            models.Index(fields=['user', 'event_type', 'timestamp']),
            models.Index(fields=['timestamp']),
        ]