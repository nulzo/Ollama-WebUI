from api.models.messages.message import Message


class MessageRepository:
    def get_message_by_id(self, message_id):
        return Message.objects.get(id=message_id)
    
    def get_all_messages(self):
        return Message.objects.all()

    def get_messages_by_conversation(self, conversation_id):
        return Message.objects.filter(conversation_id=conversation_id)

    def create_message(self, conversation, role, content, model=None, user=None):
        return Message.objects.create(
            conversation=conversation,
            role=role,
            content=content,
            model=model,
            user=user
        )

    def update_message(self, message, **kwargs):
        for attr, value in kwargs.items():
            setattr(message, attr, value)
        message.save()
        return message

    def delete_message(self, message_id):
        Message.objects.filter(id=message_id).delete()
        