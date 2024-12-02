import asyncio
import json
from django.http import StreamingHttpResponse
from ollama import Options
from api.serializers.message import MessageSerializer
from api.repositories.message_repository import MessageRepository
from api.providers.provider_factory import ProviderFactory
import logging
import base64
from api.models.agent.agent import Agent
from api.services.prompt_service import (
    PromptService,
    PromptTemplateService,
    PromptVariantService,
    PromptBuilderService,
)


class ChatService:
    """
    Main service for handling chat operations. Orchestrates the interaction
    between different services and manages the chat flow.
    """

    def __init__(self):
        self.provider_factory = ProviderFactory()
        self.message_repository = MessageRepository()
        self.logger = logging.getLogger(__name__)

    def process_image(self, image_data: bytes) -> str:
        """Process binary image data into base64 string"""
        try:
            if not image_data:
                return None
            return base64.b64encode(image_data).decode("utf-8")
        except Exception as e:
            self.logger.error(f"Error processing image: {str(e)}")
            return None

    def _agent_to_ollama_options(self, agent: Agent) -> Options:
        """Convert agent parameters to Ollama Options"""
        options: Options = {
            # Runtime options
            "seed": agent.seed,
            "num_predict": agent.num_predict,
            "top_k": agent.top_k,
            "top_p": agent.top_p,
            "tfs_z": agent.tfs_z,
            "typical_p": agent.typical_p,
            "repeat_last_n": agent.repeat_last_n,
            "temperature": agent.temperature,
            "repeat_penalty": agent.repeat_penalty,
            "presence_penalty": agent.presence_penalty,
            # Load time options
            "num_ctx": agent.num_ctx,
            "low_vram": agent.low_vram,
            "embedding_only": agent.embedding_only,
        }
        return {k: v for k, v in options.items() if v is not None}

    def handle_chat(self, serializer_data, request):
        """Handle incoming chat request"""
        try:
            # Validate and create message
            serializer = MessageSerializer(data=serializer_data, context={"request": request})

            if not serializer.is_valid():
                self.logger.warning(f"Serializer validation failed: {serializer.errors}")
                return {"errors": serializer.errors}

            # Save initial message
            message = serializer.save()
            conversation = message.conversation
            self.logger.info(f"Created message {message.id} in conversation {conversation.uuid}")

            # Process conversation history
            messages = conversation.messages.all().order_by("created_at")
            flattened_messages = [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "images": (
                        [self.process_image(img.image) for img in msg.message_images.all()]
                        if msg.has_images
                        else []
                    ),
                }
                for msg in messages
            ]

            # Return streaming response
            return StreamingHttpResponse(
                self._stream_chat_response(message, conversation, flattened_messages),
                content_type="text/event-stream",
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
            for chunk in provider.stream(message.model.name, flattened_messages):
                if isinstance(chunk, str):
                    full_content += chunk
                    yield f"data: {json.dumps({'delta': {'content': chunk}})}\n\n"
                    await asyncio.sleep(0.001)
                elif isinstance(chunk, dict):
                    if content := chunk.get("message", {}).get("content", ""):
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
                    "images": [],
                },
            )

            yield f"data: {json.dumps({'done': True})}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            self.logger.error(f"Streaming error: {str(e)}", exc_info=True)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    def _get_provider(self, model_name: str, user_id: int = None):
        """Get appropriate provider based on model name"""
        provider_name = "openai" if model_name.startswith("gpt") else "ollama"
        return self.provider_factory.get_provider(provider_name, user_id)

    def get_prompts(
        self, model_name: str, style: str = "", count: int = 5, user_id: int = None
    ) -> dict:
        """
        Get prompts based on model, style, and count
        """
        try:
            # Initialize provider
            provider = self._get_provider(model_name, user_id)

            # Initialize prompt service with provider
            prompt_service = PromptService(
                template_service=PromptTemplateService(),
                variant_service=PromptVariantService(),
                builder_service=PromptBuilderService(),
                provider=provider,
            )

            # Get prompts
            prompts = prompt_service.get_actionable_prompts(style)

            # Limit prompts to requested count
            limited_prompts = prompts[:count] if count else prompts

            return {"prompts": limited_prompts}

        except Exception as e:
            self.logger.error(f"Error generating prompts: {str(e)}")
            raise
