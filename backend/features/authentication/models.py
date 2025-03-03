from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import JSONField


class CustomUser(AbstractUser):
    name = models.CharField(max_length=150)
    icon = models.ImageField(upload_to="icons/", null=True, blank=True)
    description = models.TextField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        db_table = "user"

class Settings(models.Model):
    user = models.ForeignKey("authentication.CustomUser", on_delete=models.CASCADE)
    theme = models.CharField(max_length=30, default="dark")
    default_model = models.CharField(max_length=50, default="llama3.2:3b")
    inline_citations_enabled = models.BooleanField(default=True)
    prompt_settings = JSONField(default=dict, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Settings"
