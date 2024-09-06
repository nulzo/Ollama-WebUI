from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    name = models.CharField(max_length=150)
    color = models.CharField(max_length=150)
    icon = models.ImageField(upload_to='icons/')
    last_login = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name
