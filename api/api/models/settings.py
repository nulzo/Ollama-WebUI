# myapp/models.py

from django.db import models


class Settings(models.Model):
    setting1 = models.CharField(max_length=255, blank=True)
