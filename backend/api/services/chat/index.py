import asyncio
import json
from django.http import StreamingHttpResponse
from api.serializers.message import MessageSerializer
from repository.message_repository import MessageRepository
from api.services.provider import ProviderFactory
from api.models.messages.message import Message
from api.models.assistant.assistant import Assistant  # Add this import
import logging


class ChatService:
    def __init__(self):
        self.provider_factory = ProviderFactory()
        self.message_repository = MessageRepository()
        self.logger = logging.getLogger(__name__)


    def handle_chat(self, serializer_data, request):
        self.logger.info(f"Starting chat handling for user {request.user.id}")
        self.logger.debug(f"Received data: {serializer_data}")
        
        serializer = MessageSerializer(data=serializer_data, context={'request': request})
        
        if serializer.is_valid():
            self.logger.debug("Serializer validation passed")
            message: Message = serializer.save()
            conversation = message.conversation
            all_messages = conversation.messages.all().order_by('created_at')
            self.logger.info(f"Created user message {message.id} for conversation {message.conversation.uuid}")
            
            # Get conversation history
            all_messages = message.conversation.messages.all().order_by('created_at')
            self.logger.debug(f"Retrieved {len(all_messages)} messages from conversation history")
            
            flattened_messages = [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "images": [msg.image] if msg.image else []
                }
                for msg in all_messages
            ]

            async def async_stream_response():
                full_content = ""
                provider = self.provider_factory.get_provider("ollama")
                self.logger.info(f"Using provider: {provider}")
                
                try:
                    for chunk in provider.chat(message.model.name, flattened_messages):
                        if isinstance(chunk, str):
                            full_content += chunk
                            self.logger.debug(f"Received string chunk: {chunk[:50]}...")
                            yield f"data: {json.dumps({'delta': {'content': chunk}})}\n\n"
                            await asyncio.sleep(0.01)  # Small delay to ensure proper streaming
                        elif isinstance(chunk, dict):
                            content = chunk.get('message', {}).get('content', '')
                            if content:
                                full_content += content
                                self.logger.debug(f"Received dict chunk: {content[:50]}...")
                                yield f"data: {json.dumps({'delta': {'content': content}})}\n\n"
                                await asyncio.sleep(0.01)
                    
                    # Save the assistant's response
                    self.logger.info("Saving assistant's complete response")
                    await asyncio.to_thread(
                        self.message_repository.create_message,
                        conversation=conversation,
                        role="assistant",
                        content=full_content,
                        model=message.model,
                        user=message.user,
                        image=None
                    )
                    
                    yield f"data: {json.dumps({'done': True})}\n\n"
                    yield "data: [DONE]\n\n"
                
                except Exception as e:
                    self.logger.error(f"Error in stream_response: {str(e)}", exc_info=True)
                    yield f"data: {json.dumps({'error': str(e)})}\n\n"

            return StreamingHttpResponse(
                async_stream_response(),
                content_type='text/event-stream'
            )
        
        self.logger.warning(f"Serializer validation failed: {serializer.errors}")
        return {"errors": serializer.errors}