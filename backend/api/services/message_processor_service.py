import logging


class MessageProcessorService:
    """
    Handles message processing and formatting for chat conversations.
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def process_conversation_messages(self, conversation, image_service) -> list:
        """Process all messages in a conversation"""
        all_messages = await conversation.messages.all().order_by("created_at")

        flattened_messages = [self._format_message(msg, image_service) for msg in all_messages]

        return flattened_messages

    def _format_message(self, message, image_service) -> dict:
        """Format a single message with its images"""
        return {
            "role": message.role,
            "content": message.content,
            "images": (
                [image_service.process_images(img.image) for img in message.message_images.all()]
                if message.has_images
                else []
            ),
        }
