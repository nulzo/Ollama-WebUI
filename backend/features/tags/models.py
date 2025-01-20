from django.db import models
from features.authentication.models import CustomUser
from api.models.base import BaseModel

class Tag(BaseModel):
    name = models.CharField(max_length=50)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tags')

    class Meta:
        unique_together = ('name', 'user')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.user.username})"
