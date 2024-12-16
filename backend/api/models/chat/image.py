import os

from django.conf import settings
from django.db import models

from api.models.base import BaseModel
from api.models.chat.message import Message


class MessageImage(BaseModel):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="message_images")
    image = models.FileField(
        upload_to="message_images/%Y/%m/%d/",
    )
    order = models.IntegerField(default=0)  # To maintain image order in message

    def clean(self):
        if not self.message.has_images:
            self.message.has_images = True
            self.message.save(update_fields=["has_images"])

    def delete(self, *args, **kwargs):
        # Clean up file when model is deleted
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)

    def _delete_file(self):
        if self.image and os.path.isfile(self.image.path):
            os.remove(self.image.path)

    class Meta:
        ordering = ["order"]
