from django.db import models
from api.models.users.user import CustomUser


class Settings(models.Model):
    # user preferences
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    # ollama preferences
    default_ollama_model = models.CharField(max_length=250)
    default_ollama_port = models.IntegerField(default=11434)
    default_ollama_url = models.CharField(max_length=250, default="http://127.0.0.1")

    # openai preferences
    openai_api_key = models.CharField(max_length=100, blank=True)
    default_open_ai_model = models.CharField(max_length=300)
    default_open_ai_temperature = models.FloatField(default=0.7)
    default_open_ai_max_tokens = models.IntegerField(default=500)

    # theme preferences
    theme = models.CharField(max_length=30, default="dark")
