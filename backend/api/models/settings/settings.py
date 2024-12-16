from django.db import models


class Settings(models.Model):
    user = models.ForeignKey("api.CustomUser", on_delete=models.CASCADE)
    theme = models.CharField(max_length=30, default="dark")
    default_model = models.CharField(max_length=50, default="llama3.2:3b")

    class Meta:
        verbose_name_plural = "Settings"
