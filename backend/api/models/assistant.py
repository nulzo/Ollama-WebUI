from django.db import models


class Assistant(models.Model):
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100)
    icon = models.ImageField(upload_to='ai_models/', null=True, blank=True)
    description = models.TextField(max_length=500, null=True, blank=True)
    api_key = models.CharField(max_length=255, null=True, blank=True)
    default_temperature = models.FloatField(default=0.7)
    default_max_tokens = models.IntegerField(default=150)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.display_name
    