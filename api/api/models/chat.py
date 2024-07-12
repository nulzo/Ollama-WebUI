from django.db import models


class Chat(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    model = models.CharField(max_length=150)
    uuid = models.CharField(max_length=100, blank=False, null=False, unique=True, primary_key=True)
    name = models.CharField(blank=True, null=True, default='', max_length=150)

    def __str__(self) -> str:
        return str(f"({self.created_at.date()}) {self.name}")
