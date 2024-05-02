from django.db import models

class Chat(models.Model):
    started = models.DateTimeField(auto_now_add=True)
    model = models.CharField(max_length=150)

class UserSettings(models.Model):
    pass

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    time = models.DateTimeField(auto_now_add=True)
    model = models.CharField(max_length=100)
