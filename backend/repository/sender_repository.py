from api.models.sender.sender import Sender

class SenderRepository:
    def get_user(self, sender_id):
        sender = Sender.objects.get(id=sender_id)
        return sender if hasattr(sender, 'user') else None

    def get_assistant(self, sender_id):
        sender = Sender.objects.get(id=sender_id)
        return sender if hasattr(sender, 'assistant') else None
    