from django.db import models
from django.contrib.auth.models import AbstractUser
from api.models.sender.sender import Sender


class CustomUser(AbstractUser):
    name = models.CharField(max_length=150)
    icon = models.ImageField(upload_to="icons/", null=True, blank=True)
    description = models.TextField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)
    sender = models.OneToOneField(
        Sender, on_delete=models.CASCADE, related_name="user", null=True, blank=True
    )

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.sender:
            self.sender = Sender.objects.create()
        super().save(*args, **kwargs)
