from django.db import models


class Settings(models.Model):
    ollama_ip = models.CharField(max_length=100, blank=True)
    ollama_port = models.CharField(max_length=100, blank=True)
    ollama_default_model = models.CharField(max_length=100, blank=True)
