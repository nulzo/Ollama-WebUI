from django.apps import AppConfig


class ProvidersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "features.providers"
    
    def ready(self):
        import features.providers.signals # noqa
