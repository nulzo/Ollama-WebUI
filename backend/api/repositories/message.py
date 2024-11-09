"""
Message Repository
"""
from api.models.messages.message import Message


class MessageRepository:
    def __init__(self) -> None:
        pass

    def get_message_by_id(self, message_id: int) -> Message:
        """
        TODO: Determine if user is authenticated to view this message
        """
        queryset = Message.objects.filter(id=message_id)
        return queryset.first()
