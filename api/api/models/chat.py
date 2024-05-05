from django.db import models


class Chat(models.Model):
    started = models.DateTimeField(auto_now_add=True)
    model = models.CharField(max_length=150)
    name = models.CharField(blank=True, null=True, default='', max_length=150)

    def __str__(self) -> str:
        return str(f"({self.started.date()}) {self.name}")
