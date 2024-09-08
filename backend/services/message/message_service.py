from repository.message_repository import MessageRepository
from services.sender.user_sender_service import UserSenderService
from services.ollama.ollama import OllamaService
from api.serializers.message import MessageSerializer
from api.models.sender.sender import Sender
from services.sender.sender_service import SenderService



class MessageService:
    def __init__(self):
        self.message_repository = MessageRepository()
        self.user_sender_service = UserSenderService()
        self.ollama_service = OllamaService()
        self.sender_service = SenderService()

    def get_message(self, message_id):
        return self.message_repository.get_message_by_id(message_id)
    
    def list_messages(self):
        return self.message_repository.get_all_messages()
    
    def get_conversation_messages(self, conversation_id):
        return self.message_repository.get_messages_by_conversation(conversation_id)

    def create_message(self, conversation, role, content, sender=None, meta_user=None, meta_model=None):
        return self.message_repository.create_message(
            conversation, role, content, sender, meta_user, meta_model
        )

    def update_message(self, message, **kwargs):
        return self.message_repository.update_message(message, **kwargs)

    def delete_message(self, message_id):
        self.message_repository.delete_message(message_id)

    def handle_user_message(self, serializer_data):
        serializer = MessageSerializer(data=serializer_data)
        
        if serializer.is_valid():
            messages = serializer.get_message_content()
            conversation = serializer.get_conversation()
            model_name = serializer.get_meta_model()
            user_name = serializer.get_meta_user()
            sender = serializer.get_sender()

            message_content = self.ollama_service.create_message_context("user", messages)
            sender = self.sender_service.get_user_from_sender(sender.id)

            self.message_repository.create_message(
                conversation=conversation, role="user", sender=sender,
                content=message_content, meta_model=model_name, meta_user=user_name
            )

            response = self.ollama_service.chat(model="llama3", messages=message_content)

            if response["done"] == True:
                bot_response_content = response["message"]["content"]
                assistant = Sender.objects.get(pk=2)
                self.message_repository.create_message(
                    conversation=conversation, role="assistant",
                    content=bot_response_content, sender=assistant
                )
                return response
            else:
                return response
        
        return {"errors": serializer.errors}
