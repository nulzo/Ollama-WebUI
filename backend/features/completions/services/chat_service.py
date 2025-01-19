import asyncio
import base64
from timeit import default_timer as timer
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
from api.models.chat.conversation import Conversation
from features.conversations.repositories.message_repository import MessageRepository
from features.conversations.serializers.message import MessageSerializer
from api.models.auth.user import CustomUser
from django.contrib.auth import get_user_model
from features.knowledge.services.knowledge_service import KnowledgeService
from api.services.prompt_service import (
    PromptBuilderService,
    PromptService,
    PromptTemplateService,
    PromptVariantService,
)

logger = logging.getLogger(__name__)


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
                if isinstance(message_image.image, str):
                    # If it's already a base64 string, decode it to bytes
                    images.append(base64.b64decode(message_image.image))
                else:
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
            print(request)
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
            model_info = {"name": message.model, "display_name": message.model}

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
        provider = self._get_provider(message.model)

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

            for chunk in provider.stream(message.model, flattened_messages):
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

    def generate_response(self, data: dict, user) -> Generator[str, None, None]:
        """Generate streaming response for chat"""
        generation_id = id(self)
        self._cancel_event.clear()
        start = timer()

        try:
            # Try to get conversation or create new one if not provided
            conversation = None
            if conversation_uuid := data.get("conversation_uuid"):
                try:
                    conversation = Conversation.objects.get(uuid=conversation_uuid)
                except Conversation.DoesNotExist:
                    logger.info(
                        f"Conversation {conversation_uuid} not found, creating new conversation"
                    )
                    conversation = None

            if not conversation:
                # Create new conversation
                conversation = Conversation.objects.create(
                    user=user, name=data.get("content", "New Conversation")[:50]
                )
                # Send conversation UUID as first chunk
                yield json.dumps({"conversation_uuid": str(conversation.uuid), "status": "created"})
                logger.info(f"Created new conversation {conversation.uuid} for user {user.id}")

            try:
                if isinstance(user, int):
                    user = CustomUser.objects.get(id=user)
                elif isinstance(data.get("user"), int):
                    user = CustomUser.objects.get(id=data["user"])
            except CustomUser.DoesNotExist:
                error_msg = "User not found"
                logger.error(f"Error in generation {generation_id}: {error_msg}")
                yield json.dumps({"error": error_msg, "status": "error"})
                return

            try:
                images = data.get("images", [])
            except Exception as e:
                self.logger.error(f"Error processing images: {str(e)}")
                images = []

            # Create the user's message with conversation instance
            user_message = self.message_repository.create(
                {
                    "conversation": conversation,  # Pass the conversation instance instead of UUID
                    "content": data.get("content", ""),
                    "role": "user",
                    "user": user,
                    "model": data.get("model", "llama3.2:3b"),
                    "images": images,
                }
            )

            # Get the appropriate provider
            provider = self._get_provider(data.get("model", "llama3.2:3b"))

            # Process conversation history
            messages = list(user_message.conversation.messages.all().order_by("created_at"))

            if user_message not in messages:
                messages.append(user_message)

            # Format messages for provider
            formatted_messages = [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "images": self._process_message_images(msg),
                }
                for msg in messages
            ]

            # Stream the response
            tokens_generated = 0
            full_content = ""
            for chunk in provider.stream(data.get("model", "llama3.2:3b"), formatted_messages):
                if isinstance(chunk, str):
                    chunk_data = json.loads(chunk)
                    full_content += chunk_data.get("content", "")
                    tokens_generated += 1
                    yield json.dumps(chunk_data) + "\n"

            end = timer()
            generation_time = end - start

            # Update final message content if not cancelled
            if not self._cancel_event.is_set():
                assistant_message = self.message_repository.create(
                    {
                        "conversation": user_message.conversation,
                        "content": full_content,
                        "role": "assistant",
                        "user": user,
                        "tokens_used": tokens_generated,
                        "model": data.get("model"),
                        "generation_time": generation_time,
                        "finish_reason": "stop",
                    }
                )
                yield json.dumps({"status": "done", "message_id": str(assistant_message.id)})

        except Exception as e:
            logger.error(f"Error in generation {generation_id}: {str(e)}\n{traceback.format_exc()}")
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

    def cancel_generation(self):
        """Mark the current generation as cancelled"""
        self._cancel_event.set()
