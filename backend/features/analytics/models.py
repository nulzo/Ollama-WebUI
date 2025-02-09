import uuid
from django.db import models
from api.models.base import BaseModel

class EventLog(BaseModel):
    """Analytics events for tracking user activity"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("authentication.CustomUser", on_delete=models.CASCADE)
    event_type = models.CharField(max_length=50)
    data = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.timestamp}] {self.user} - {self.event_type}"
    
    class Meta:
        db_table = "event_logs"
        indexes = [
            models.Index(fields=['user', 'event_type'])
        ]