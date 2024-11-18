import asyncio
import json
from django.http import StreamingHttpResponse
from api.serializers.message import MessageSerializer
from repository.message_repository import MessageRepository
from api.services.provider import ProviderFactory
from api.models.messages.message import Message
import logging


class ChatService:
    def __init__(self):
        self.provider_factory = ProviderFactory()
        self.message_repository = MessageRepository()
        self.logger = logging.getLogger(__name__)

    def process_image(self, images):
        try:
            if not isinstance(images, list):
                self.logger.warning(f"Expected list of images, got {type(images)}")
                return []
                
            processed_images = []
            for image_str in images:
                try:
                    # Split on comma and take second part (the actual base64 data)
                    base64_data = image_str.split(',')[1]
                    print(base64_data[:50])
                    # Convert base64 to bytes
                    import base64
                    image_bytes = base64.b64decode(base64_data)
                    processed_images.append(image_bytes)
                except Exception as e:
                    self.logger.warning(f"Error processing individual image: {str(e)}")
                    continue
                    
            self.logger.info(f"Processed {len(processed_images)} images")
            return processed_images
        except Exception as e:
            self.logger.warning(f"Error processing images: {str(e)}")
            return []


    def handle_chat(self, serializer_data, request):
        # self.logger.info(f"Starting chat handling for user {request.user.id}")
        # self.logger.debug(f"Received data: {serializer_data}")
        
        serializer = MessageSerializer(data=serializer_data, context={'request': request})
        
        if serializer.is_valid():
            self.logger.debug("Serializer validation passed")
            message: Message = serializer.save()
            conversation = message.conversation
            all_messages = conversation.messages.all().order_by('created_at')
            self.logger.info(f"Created user message {message.id} for conversation {message.conversation.uuid}")
            
            # Get conversation history
            all_messages = message.conversation.messages.all().order_by('created_at')
            # self.logger.debug(f"Retrieved {len(all_messages)} messages from conversation history")
            
            flattened_messages = [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "images": self.process_image(msg.get_images()) if msg.images else []
                }
                for msg in all_messages
            ]

            self.logger.info(f"Flattened messages: {flattened_messages}")

            async def async_stream_response():
                full_content = ""
                provider_name = "openai" if message.model.name.startswith("gpt") else "ollama"
                provider = self.provider_factory.get_provider(provider_name)
                self.logger.info(f"Using provider: {provider}")
                yield f"data: {json.dumps({'conversation_uuid': str(conversation.uuid)})}\n\n"
                
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
                        images=[]
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