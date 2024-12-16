import logging

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from api.models import Conversation, Message, MessageImage

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Message)
def update_conversation_timestamp(sender, instance, created, **kwargs):
    """Update conversation timestamp when message is created"""
    if created and instance.conversation:
        Conversation.objects.filter(uuid=instance.conversation.uuid).update(
            updated_at=instance.created_at
        )


@receiver(post_delete, sender=MessageImage)
def cleanup_image_files(sender, instance, **kwargs):
    """Clean up image files when MessageImage is deleted"""
    try:
        if instance.image:
            instance.image.delete(save=False)
    except Exception as e:
        logger.error(f"Failed to delete image file: {e}")
