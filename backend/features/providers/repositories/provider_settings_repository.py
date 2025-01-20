from typing import List, Optional
from django.db import transaction
from features.providers.models import ProviderSettings
from api.utils.interfaces import BaseRepository

class ProviderSettingsRepository(BaseRepository[ProviderSettings]):
    def __init__(self):
        super().__init__(model_class=ProviderSettings)

    def get_by_id(self, id: int) -> Optional[ProviderSettings]:
        try:
            return self.model.objects.get(id=id)
        except self.model.DoesNotExist:
            return None

    def get_all(self) -> List[ProviderSettings]:
        return self.model.objects.all()

    def get_by_user(self, user_id: int) -> List[ProviderSettings]:
        return self.model.objects.filter(user_id=user_id)

    def get_by_user_and_provider(
        self, user_id: int, provider_type: str
    ) -> Optional[ProviderSettings]:
        try:
            return self.model.objects.get(user_id=user_id, provider_type=provider_type)
        except self.model.DoesNotExist:
            return None

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
