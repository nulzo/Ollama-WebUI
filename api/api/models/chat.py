from django.db import models

class Chat(models.Model):
    started = models.DateTimeField(auto_now_add=True)
    model = models.CharField(max_length=150)
