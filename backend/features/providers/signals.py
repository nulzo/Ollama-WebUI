import os
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from features.providers.models import ProviderSettings

User = get_user_model()

@receiver(post_save, sender=User)
def create_default_provider_settings(sender, instance, created, **kwargs):
    print(f"Creating default provider settings for user: {instance.id}")
    if created:
        default_settings = [
            {
                "provider_type": "ollama",
                "api_key": os.environ.get("OLLAMA_API_KEY", ""),
                "endpoint": os.environ.get("OLLAMA_ENDPOINT", ""),
                "organization_id": "",
                "is_enabled": bool(os.environ.get("OLLAMA_ENDPOINT", "")),
            },
            {
                "provider_type": "openai",
                "api_key": os.environ.get("OPENAI_API_KEY", ""),
                "endpoint": os.environ.get("OPENAI_ENDPOINT", ""),
                "organization_id": os.environ.get("OPENAI_ORGANIZATION_ID", ""),
                "is_enabled": bool(os.environ.get("OPENAI_API_KEY", "")),
            },
            {
                "provider_type": "anthropic",
                "api_key": os.environ.get("ANTHROPIC_API_KEY", ""),
                "endpoint": os.environ.get("ANTHROPIC_ENDPOINT", ""),
                "organization_id": "",
                "is_enabled": bool(os.environ.get("ANTHROPIC_API_KEY", "")),
            },
            {
                "provider_type": "azure",
                "api_key": os.environ.get("AZURE_API_KEY", ""),
                "endpoint": os.environ.get("AZURE_ENDPOINT", ""),
                "organization_id": os.environ.get("AZURE_ORGANIZATION_ID", ""),
                "is_enabled": bool(os.environ.get("AZURE_API_KEY", "")),
            },
            {
                "provider_type": "google",
                "api_key": os.environ.get("GOOGLE_API_KEY", ""),
                "endpoint": os.environ.get("GOOGLE_ENDPOINT", ""),
                "organization_id": "",
                "is_enabled": bool(os.environ.get("GOOGLE_API_KEY", "")),
            },
        ]
        print(f"Default settings: {default_settings}")
        for settings_data in default_settings:
            ProviderSettings.objects.create(user=instance, **settings_data)