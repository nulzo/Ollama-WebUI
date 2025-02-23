from typing import List, Optional
from django.db import transaction
from features.providers.models import ProviderSettings
from api.utils.interfaces import BaseRepository

class ProviderSettingsRepository:
    def __init__(self):
        self.model = ProviderSettings

    def get_by_user_and_provider(
        self, user_id: int, provider_type: str
    ) -> Optional[ProviderSettings]:
        try:
            return self.model.objects.get(user_id=user_id, provider_type=provider_type)
        except self.model.DoesNotExist:
            return None

    def get_by_user(self, user_id):
        return ProviderSettings.objects.filter(user_id=user_id)

    @transaction.atomic
    def create(self, data: dict) -> ProviderSettings:
        return self.model.objects.create(**data)

    @transaction.atomic
    def update(self, instance: ProviderSettings, data: dict) -> ProviderSettings:
        for field, value in data.items():
            if hasattr(instance, field):
                setattr(instance, field, value)
        instance.save()
        return instance

    @transaction.atomic
    def delete(self, instance: ProviderSettings) -> bool:
        instance.delete()
        return True

    @transaction.atomic
    def update_or_create(self, user_id: int, provider_type: str, data: dict) -> ProviderSettings:
        instance = self.get_by_user_and_provider(user_id, provider_type)
        if instance:
            return self.update(instance, data)
        return self.create({**data, "user_id": user_id, "provider_type": provider_type})
