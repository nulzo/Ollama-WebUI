import uuid

from django.db import models


class BaseModel(models.Model):
    """Base model for all models used."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class BaseManager(models.Manager):
    def get_related_fields(self):
        """Override in subclasses to specify related fields"""
        return []

    def get_queryset(self):
        qs = super().get_queryset()
        related_fields = self.get_related_fields()
        if related_fields:
            qs = qs.select_related(*related_fields)
        return qs
