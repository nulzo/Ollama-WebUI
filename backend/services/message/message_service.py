from repository.message_repository import MessageRepository
from services.ollama.ollama import OllamaService
from api.serializers.message import MessageSerializer
from api.models.messages.message import Message
from django.http import StreamingHttpResponse
import json
import base64


class MessageService:
    def __init__(self):
        self.message_repository = MessageRepository()
        self.ollama_service = OllamaService()

    def get_message(self, message_id):
        return self.message_repository.get_message_by_id(message_id)

    def list_messages(self):
        return self.message_repository.get_all_messages()

    def get_conversation_messages(self, conversation_id):
        return self.message_repository.get_messages_by_conversation(conversation_id)

    def create_message(self, conversation, role, content, model=None, user=None):
        return self.message_repository.create_message(
            conversation, role, content, model, user
        )

    def update_message(self, message, **kwargs):
        return self.message_repository.update_message(message, **kwargs)

    def delete_message(self, message_id):
        self.message_repository.delete_message(message_id)

    def handle_user_message(self, serializer_data):
        serializer = MessageSerializer(data=serializer_data)

        if serializer.is_valid():
            messages = serializer.validated_data.get("content")
            conversation = serializer.validated_data.get("conversation")
            user_id = serializer.validated_data.get("user")
            model_id = serializer.validated_data.get("model")
            image_data_url = serializer.validated_data.get("image")

            if not model_id:
                return serializer.errors
            
            if not conversation.name:
                conversation.name = messages
                conversation.save()

            base64_data = None
            if image_data_url:
                # Extract the base64 data from the data URL
                _, base64_data = image_data_url.split(',', 1)

            self.message_repository.create_message(
                conversation=conversation,
                role="user",
                content=messages,
                model=model_id,
                user=user_id,
                image=base64_data
            )
            
            all_messages = conversation.messages.all().order_by('created_at')
            
            flattened_messages = []

            for message in all_messages:
                message_dict = {
                    "role": message.role,
                    "content": message.content
                }
                if message.image:
                    message_dict["images"] = [base64_data]
                flattened_messages.append(message_dict)

            def stream_response():
                full_content = ""
                for chunk in self.ollama_service.chat(model=model_id.name, messages=flattened_messages):
                    full_content += chunk.get("message", {}).get("content", "")
                    yield f"data: {json.dumps(chunk)}\n\n"
                
                # After streaming is complete, save the full message
                self.message_repository.create_message(
                    conversation=conversation,
                    role="assistant",
                    content=full_content,
                    model=model_id,
                    user=user_id,
                    image=None
                )
                
                yield "data: [DONE]\n\n"

            return StreamingHttpResponse(stream_response(), content_type='text/event-stream')

        return {"errors": serializer.errors}
