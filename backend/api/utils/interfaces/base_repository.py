from typing import TypeVar, Generic, List, Optional
from django.db import models

T = TypeVar('T', bound=models.Model)

class BaseRepository(Generic[T]):
    def __init__(self, model_class: T):
        self.model_class = model_class

    def get_by_id(self, id: int) -> Optional[T]:
        try:
            return self.model_class.objects.get(id=id)
        except self.model_class.DoesNotExist:
            return None

    def list(self) -> List[T]:
        return self.model_class.objects.all()

    def update(self, id: int, data: dict) -> Optional[T]:
        try:
            instance = self.get_by_id(id)
            if instance:
                for key, value in data.items():
                    setattr(instance, key, value)
                instance.save()
                return instance
            return None
        except Exception as e:
            raise Exception(f"Error updating {self.model_class.__name__}: {str(e)}")

    def delete(self, id: int) -> bool:
        try:
            instance = self.get_by_id(id)
            if instance:
                instance.delete()
                return True
            return False
        except Exception as e:
            raise Exception(f"Error deleting {self.model_class.__name__}: {str(e)}")