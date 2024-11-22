import asyncio
import json
from django.http import StreamingHttpResponse
from api.serializers.message import MessageSerializer
from api.repositories.message_repository import MessageRepository
from api.providers.provider_factory import ProviderFactory
from api.models.messages import Message
import logging


class ChatService:
    """
    Main service for handling chat operations. Orchestrates the interaction
    between different services and manages the chat flow.
    """

    def __init__(self):
        self.provider_factory = ProviderFactory()
        self.message_repository = MessageRepository()
        self.logger = logging.getLogger(__name__)

    def process_image(self, images):
        """Process and validate image data"""
        try:
            if not isinstance(images, list):
                self.logger.warning(f"Expected list of images, got {type(images)}")
                return []

            processed_images = []
            for image_str in images:
                try:
                    base64_data = image_str.split(',')[1]
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
        """Handle incoming chat request"""
        try:
            # Validate and create message
            serializer = MessageSerializer(
                data=serializer_data,
                context={'request': request}
            )

            if not serializer.is_valid():
                self.logger.warning(f"Serializer validation failed: {serializer.errors}")
                return {"errors": serializer.errors}

            # Save initial message
            message = serializer.save()
            conversation = message.conversation
            self.logger.info(f"Created message {message.id} in conversation {conversation.uuid}")

            # Process conversation history
            messages = conversation.messages.all().order_by('created_at')
            flattened_messages = [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "images": self.process_image(msg.get_images()) if msg.images else []
                }
                for msg in messages
            ]

            # Return streaming response
            return StreamingHttpResponse(
                self._stream_chat_response(message, conversation, flattened_messages),
                content_type='text/event-stream'
            )

        except Exception as e:
            self.logger.error(f"Chat handling error: {str(e)}", exc_info=True)
            return {"errors": str(e)}

    async def _stream_chat_response(self, message, conversation, flattened_messages):
        """Stream the chat response from the provider"""
        full_content = ""
        provider = self._get_provider(message.model.name)

        # Send initial conversation UUID
        yield f"data: {json.dumps({'conversation_uuid': str(conversation.uuid)})}\n\n"

        try:
            # Stream provider response
            for chunk in provider.chat(message.model.name, flattened_messages):
                if isinstance(chunk, str):
                    full_content += chunk
                    yield f"data: {json.dumps({'delta': {'content': chunk}})}\n\n"
                    await asyncio.sleep(0.001)
                elif isinstance(chunk, dict):
                    if content := chunk.get('message', {}).get('content', ''):
                        full_content += content
                        yield f"data: {json.dumps({'delta': {'content': content}})}\n\n"
                        await asyncio.sleep(0.001)

            await asyncio.to_thread(
                self.message_repository.create,
                {
                    "conversation": conversation,
                    "role": "assistant",
                    "content": full_content,
                    "model": message.model,
                    "user": message.user,
                    "images": []
                }
            )

            yield f"data: {json.dumps({'done': True})}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            self.logger.error(f"Streaming error: {str(e)}", exc_info=True)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    def _get_provider(self, model_name: str):
        """Get appropriate provider based on model name"""
        provider_name = "openai" if model_name.startswith("gpt") else "ollama"
        return self.provider_factory.get_provider(provider_name)