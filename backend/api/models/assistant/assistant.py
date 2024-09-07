from django.db import models
from api.models.sender.sender import Sender


class Assistant(models.Model):
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100)
    icon = models.ImageField(upload_to="icons/", null=True, blank=True)
    description = models.TextField(max_length=500, null=True, blank=True)
    api_key = models.CharField(max_length=255, null=True, blank=True)
    default_temperature = models.FloatField(default=0.7)
    default_max_tokens = models.IntegerField(default=150)
    created_at = models.DateTimeField(auto_now_add=True)
    sender = models.OneToOneField(Sender, on_delete=models.CASCADE, blank=True, null=True, related_name="assistant")

    def __str__(self):
        return self.display_name
    
    def save(self, *args, **kwargs):
        if not self.sender:
            self.sender = Sender.objects.create()
        super().save(*args, **kwargs)
