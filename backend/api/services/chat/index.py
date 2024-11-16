import json
from django.http import StreamingHttpResponse
from api.serializers.message import MessageSerializer
from repository.message_repository import MessageRepository
from api.services.provider import ProviderFactory
from api.models.messages.message import Message


class ChatService:
    def __init__(self):
        self.message_repository = MessageRepository()
        self.provider_factory = ProviderFactory()

    def handle_chat(self, serializer_data, request):
        serializer = MessageSerializer(data=serializer_data, context={'request': request})

        if serializer.is_valid():
            message: Message = serializer.save()
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

            def stream():
                full_content = ""
                provider_name = "openai" if message.model.name.startswith('gpt-') else "ollama"
                provider = self.provider_factory.get_provider(provider_name)
                content = provider.chat(message.model.name, flattened_messages)
                
                for chunk in content:
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


            return StreamingHttpResponse(stream(), content_type='text/event-stream')

        return {"errors": serializer.errors}
