from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from features.providers.models import ProviderSettings

User = get_user_model()

@receiver(post_save, sender=User)
def create_default_provider_settings(sender, instance, created, **kwargs):
    if created:
        # Create Ollama provider settings as default
        ProviderSettings.objects.create(
            user=instance,
            provider_type='ollama',
            endpoint='http://localhost:11434',
            is_enabled=True,
            is_default=True
        )
