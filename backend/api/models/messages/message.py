import json
from django.db import models
from api.models.conversation.conversation import Conversation
from api.models.assistant.assistant import Assistant
from api.models.users.user import CustomUser
import logging

logger = logging.getLogger(__name__)


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages", null=True, blank=True
    )
    role = models.CharField(max_length=25, blank=False, null=False)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    model = models.ForeignKey(Assistant, on_delete=models.PROTECT, null=True, blank=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    images = models.TextField(null=True, blank=True)

    def set_images(self, images_list):
        logger.info(f"Setting images: {images_list}")
        try:
            if images_list:
                if isinstance(images_list, str):
                    self.images = images_list
                else:
                    import json
                    self.images = json.dumps(images_list)
            else:
                self.images = None
        except Exception as e:
            logger.error(f"Error setting images: {e}")
            self.images = None

    def get_images(self):
        logger.info(f"Getting images: {self.images}")
        if not self.images:
            return []
        try:
            if isinstance(self.images, str):
                # First try to parse as JSON
                try:
                    import json
                    return json.loads(self.images)
                except json.JSONDecodeError:
                    # If not JSON, treat as single image string
                    return [self.images]
            elif isinstance(self.images, list):
                return self.images
            else:
                return []
        except Exception as e:
            logger.error(f"Error parsing images: {e}")
            return []

    def __str__(self) -> str:
        return self.content[:15]
