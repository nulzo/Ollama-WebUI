from repository.sender_repository import SenderRepository

class SenderService:
    def __init__(self):
        self.sender_repository = SenderRepository()

    def get_user_from_sender(self, sender_id):
        return self.sender_repository.get_user(sender_id)
    
    def get_assistant_from_sender(self, sender_id):
        return self.sender_repository.get_assistant(sender_id)
    