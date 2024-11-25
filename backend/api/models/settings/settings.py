from django.db import models

class ProviderSettings(models.Model):
    user = models.ForeignKey('api.CustomUser', on_delete=models.CASCADE)
    provider_type = models.CharField(max_length=50)
    api_key = models.CharField(max_length=255, blank=True)
    endpoint = models.CharField(max_length=255, blank=True)
    organization_id = models.CharField(max_length=255, blank=True)
    is_enabled = models.BooleanField(default=False)

class Settings(models.Model):
   user = models.ForeignKey('api.CustomUser', on_delete=models.CASCADE)
   theme = models.CharField(max_length=30, default="dark")
   default_model = models.CharField(max_length=50, default="llama3.2:3b")
   
   class Meta:
       verbose_name_plural = "Settings"
