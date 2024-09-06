from django.db import models
from api.models.conversation import Conversation
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


class Message(models.Model):

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=25, blank=False, null=False)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    sender = GenericForeignKey('content_type', 'object_id')

    def __str__(self) -> str:
        return self.content[:15]
