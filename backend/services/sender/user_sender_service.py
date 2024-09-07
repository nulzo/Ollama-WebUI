from api.models.sender.sender import Sender
from api.models.users.user import CustomUser


class UserSenderService:
    def get_user_by_name(self, name):
        try:
            return CustomUser.objects.get(name=name)
        except CustomUser.DoesNotExist as exception:
            raise exception
        
    def get_user_by_sender_id(self, sender):
        return sender.usersender.user.id
    
    def get_sender_by_name(self, name):
        # Return the senders ID given the name associated with a user
        user = self.get_user_by_name(name)
        if user:
            try:
                user_sender = Sender.objects.get(user=user)
                return user_sender
            except Sender.DoesNotExist as exception:
                raise exception
        return None
    
    def get_sender_by_id(self, sender_id):
        # Return the senders ID given the id associated with a user
        user = self.get_user_by_name(name)
        if user:
            try:
                user_sender = Sender.objects.get(user=user)
                return user_sender
            except Sender.DoesNotExist as exception:
                raise exception
        return None

    def get_sender_id_by_id(self, id): ...
