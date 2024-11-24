from django.db import models
from api.models.messages.message import Message

class MessageImage(models.Model):
    message = models.ForeignKey(
        Message, 
        on_delete=models.CASCADE, 
        related_name='message_images'
    )
    image = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)
    order = models.IntegerField(default=0)  # To maintain image order in message

    class Meta:
        ordering = ['order']
