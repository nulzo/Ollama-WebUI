"""
Message Service
"""

from api.models.messages.message import Message
from api.repositories.message import MessageRepository


class MessageService:
    def __init__(self, message_repository: MessageRepository):
        self.message_repository = message_repository

    def get_message(self, message_id) -> Message:
        """
        TODO: Determine if the message is null and raise exception
        """
        return self.message_repository.get_message_by_id(message_id)

