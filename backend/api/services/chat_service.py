import asyncio
import json
import logging
import traceback
from threading import Event
from typing import Generator

from asgiref.sync import sync_to_async
from django.http import StreamingHttpResponse
from ollama import Options

from api.models.agent.agent import Agent
from api.providers.provider_factory import ProviderFactory
from api.repositories.message_repository import MessageRepository
from api.serializers.message import MessageSerializer
from api.services.knowledge_service import KnowledgeService
from api.services.prompt_service import (PromptBuilderService, PromptService,
                                         PromptTemplateService,
                                         PromptVariantService)


class ChatService:
    """
    Main service for handling chat operations. Orchestrates the interaction
    between different services and manages the chat flow.
    """

    def __init__(self):
        self.provider_factory = ProviderFactory()
        self.message_repository = MessageRepository()
        self.knowledge_service = KnowledgeService()
        self.logger = logging.getLogger(__name__)
        self._cancel_event = Event()

    async def _prepare_context(self, message_content: str, user_id: int) -> str:
        """Prepare knowledge context for the message"""
        try:
            relevant_docs = self.knowledge_service.find_relevant_context(message_content, user_id)

            if not relevant_docs:
                return ""

            context = "Relevant context:\n\n"
            for doc in relevant_docs:
                context += f"---\n{doc['content']}\n"
            return context

        except Exception as e:
            self.logger.error(f"Error preparing context: {str(e)}")
            return ""

    def _process_message_images(self, message):
        """Convert message images to bytes for Ollama"""
        if not message.has_images:
            return []

        images = []
        for message_image in message.message_images.all():
            try:
                # Read the image file into bytes
                message_image.image.seek(0)  # Ensure we're at the start of the file
                image_bytes = message_image.image.read()
                images.append(image_bytes)
            except Exception as e:
                self.logger.error(f"Error processing image for message {message.id}: {str(e)}")
                continue
        return images

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

            # Get model information
            model_info = {"name": message.model.name, "display_name": message.model.display_name}

            # Return streaming response with initial data
            return StreamingHttpResponse(
                self._stream_chat_response(message, conversation, model_info),
                content_type="text/event-stream",
            )

        except Exception as e:
            self.logger.error(f"Chat handling error: {str(e)}", exc_info=True)
            return {"errors": str(e)}

    async def _stream_chat_response(self, message, conversation, model_info):
        """Stream the chat response from the provider"""
        full_content = ""
        provider = self._get_provider(message.model.name)

        # Send initial data including conversation UUID and model info
        initial_data = {
            "conversation_uuid": str(conversation.uuid),
            "model": model_info,
            "message_id": message.id,
            "type": "init",
        }
        yield f"data: {json.dumps(initial_data)}\n\n"

        try:
            # Process conversation history
            messages = await sync_to_async(list)(conversation.messages.all().order_by("created_at"))

            # Get context for the last user message
            context = await self._prepare_context(message.content, conversation.user.id)

            flattened_messages = []

            # Add system context if available
            if context:
                flattened_messages.append({"role": "system", "content": context})

            # Add conversation messages
            flattened_messages.extend(
                [
                    {
                        "role": msg.role,
                        "content": msg.content,
                        "images": await sync_to_async(self._process_message_images)(msg),
                    }
                    for msg in messages
                ]
            )

            # Stream provider response
            self.logger.info(f"Streaming message to ollama: {flattened_messages}")

            for chunk in provider.stream(message.model.name, flattened_messages):
                if isinstance(chunk, str):
                    full_content += chunk
                    yield f"data: {json.dumps({'delta': {'content': chunk}, 'type': 'content'})}\n\n"
                    await asyncio.sleep(0.001)
                elif isinstance(chunk, dict):
                    if content := chunk.get("message", {}).get("content", ""):
                        full_content += content
                        yield f"data: {json.dumps({'delta': {'content': content}, 'type': 'content'})}\n\n"
                        await asyncio.sleep(0.001)
            # Create assistant's response message
            response_message = await sync_to_async(self.message_repository.create)(
                {
                    "conversation": conversation,
                    "role": "assistant",
                    "content": full_content,
                    "model": message.model,
                    "user": message.user,
                    "images": [],
                },
            )

            # Send completion data
            completion_data = {"type": "done", "message_id": response_message.id, "done": True}
            yield f"data: {json.dumps(completion_data)}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            self.logger.error(f"Streaming error: {str(e)}\n{traceback.format_exc()}")
            yield f"data: {json.dumps({'error': str(e), 'type': 'error'})}\n\n"

    def generate_response(self, serializer_data: dict, user) -> Generator[str, None, None]:
        # Reset cancel event for new generation
        self._cancel_event.clear()
        generation_id = id(self)

        try:
            # Validate and create message
            serializer = MessageSerializer(data=serializer_data, context={"user": user})
            if not serializer.is_valid():
                yield json.dumps({"error": serializer.errors, "status": "error"})
                return

            # Save initial message
            message = serializer.save()
            conversation = message.conversation
            self.logger.info(f"Created message {message.id} in conversation {conversation.uuid}")

            # Send initial data
            yield json.dumps(
                {
                    "conversation_uuid": str(conversation.uuid),
                    "model": {
                        "name": message.model.name,
                        "display_name": message.model.display_name,
                    },
                    "message_id": message.id,
                    "status": "init",
                }
            )

            # Get provider and process messages
            provider = self._get_provider(message.model.name)
            messages = list(conversation.messages.all().order_by("created_at"))

            flattened_messages = [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "images": self._process_message_images(msg),
                }
                for msg in messages
            ]
            # Stream the response
            full_content = ""
            tokens_generated = 0

            for chunk in provider.stream(message.model.name, flattened_messages):
                if self._cancel_event.is_set():
                    self.logger.info(
                        f"Generation {generation_id} cancelled after {tokens_generated} tokens"
                    )
                    yield json.dumps({"content": " [Generation cancelled]", "status": "cancelled"})
                    return

                if isinstance(chunk, (str, dict)):
                    content = (
                        chunk
                        if isinstance(chunk, str)
                        else chunk.get("message", {}).get("content", "")
                    )
                    if content:
                        full_content += content
                        tokens_generated += 1
                        yield json.dumps({"content": content, "status": "generating"})

            # Create assistant's response message
            response_message = self.message_repository.create(
                {
                    "conversation": conversation,
                    "role": "assistant",
                    "content": full_content,
                    "model": message.model,
                    "user": user,
                    "images": [],
                }
            )
            # Send completion data
            yield json.dumps({"status": "done", "message_id": response_message.id, "done": True})

        except Exception as e:
            self.logger.error(f"Error in generation {generation_id}: {str(e)}")
            yield json.dumps({"error": str(e), "status": "error"})

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
