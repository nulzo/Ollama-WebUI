from django.db import models
from api.models.base import BaseModel

class MessageInteraction(BaseModel):
    user = models.ForeignKey(
        'auth.CustomUser',
        on_delete=models.CASCADE,
        related_name="%(class)s_messages"
    )
    message = models.ForeignKey(
        'chat.Message',
        on_delete=models.CASCADE,
        related_name="%(class)s_by"
    )

    class Meta:
        abstract = True
        unique_together = ("user", "message")

    def __str__(self):
        return f"{self.user.name} {self._interaction_type} {self.message.content[:15]}"

class LikedMessage(MessageInteraction):
    _interaction_type = "liked"
    
    class Meta(MessageInteraction.Meta):
        db_table = "chat_liked_messages"

class PinnedMessage(MessageInteraction):
    _interaction_type = "pinned"
    
    class Meta(MessageInteraction.Meta):
        db_table = "chat_pinned_messages"

class DeletedMessage(MessageInteraction):
    _interaction_type = "deleted"
    
    class Meta(MessageInteraction.Meta):
        db_table = "chat_deleted_messages"