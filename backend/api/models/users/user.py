from django.db import models
from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver
from django.db.models.signals import post_save
from api.models.settings.settings import ProviderSettings, Settings


class CustomUser(AbstractUser):
    name = models.CharField(max_length=150)
    icon = models.ImageField(upload_to="icons/", null=True, blank=True)
    description = models.TextField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name


@receiver(post_save, sender=CustomUser)
def create_user_settings(sender, instance, created, **kwargs):
    if created:
        Settings.objects.create(user=instance)

        default_providers = [
            {"provider_type": "ollama", "is_enabled": True, "endpoint": "http://localhost:11434"},
            {"provider_type": "openai", "is_enabled": False},
            {"provider_type": "azure", "is_enabled": False},
            {"provider_type": "anthropic", "is_enabled": False},
        ]

        for provider in default_providers:
            ProviderSettings.objects.create(user=instance, **provider)
