import json
from django.http import StreamingHttpResponse
from api.serializers.message import MessageSerializer
from api.models.conversation.conversation import Conversation
from services.openai.openai import OpenAIService
from repository.message_repository import MessageRepository
from services.ollama.ollama import OllamaService
from api.models.messages.message import Message

class MessageService:
    def __init__(self):
        self.message_repository = MessageRepository()
        self.ollama_service = OllamaService()
        self.openai_service = OpenAIService()

    def handle_user_message(self, serializer_data, request):
        serializer = MessageSerializer(data=serializer_data, context={'request': request})

        if serializer.is_valid():
            message: Message = serializer.save()
            print(message, type(message))
            # Fetch the conversation
            conversation = message.conversation
            all_messages = conversation.messages.all().order_by('created_at')
            
            flattened_messages = [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "images": [msg.image] if msg.image else []
                }
                for msg in all_messages
            ]

            full_content = ""

            def stream_response():
                # Determine provider based on model
                model = message.model.name
                if model.startswith('gpt-'):
                    # OpenAI
                    chat_generator = self.openai_service.chat_stream(model=model, messages=flattened_messages)
                else:
                    # Ollama
                    chat_generator = self.ollama_service.chat(model=model, messages=flattened_messages)

                for chunk in chat_generator:
                    full_content += chunk.get("message", {}).get("content", "")
                    yield f"data: {json.dumps(chunk)}\n\n"
                
                # After streaming is complete, save the full message
                self.message_repository.create_message(
                    conversation=conversation,
                    role="assistant",
                    content=full_content,
                    model=message.model,
                    user=message.user,
                    image=None
                )
                
                yield "data: [DONE]\n\n"
            return StreamingHttpResponse(stream_response(), content_type='text/event-stream')


        return {"errors": serializer.errors}