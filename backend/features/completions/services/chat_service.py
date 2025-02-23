import asyncio
import base64
from timeit import default_timer as timer
import json
import logging
import traceback
from threading import Event
from typing import Generator
from features.analytics.services.analytics_service import AnalyticsEventService
from features.conversations.services.conversation_service import ConversationService
from features.providers.clients.provider_factory import provider_factory
from features.conversations.repositories.message_repository import MessageRepository
from features.authentication.models import CustomUser

from features.knowledge.services.knowledge_service import KnowledgeService
from features.prompts.services.prompt_service import (
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
        self.provider_factory = provider_factory
        self.message_repository = MessageRepository()
        self.knowledge_service = KnowledgeService()
        self.analytics_service = AnalyticsEventService()
        self.conversation_service = ConversationService()
        self.logger = logging.getLogger(__name__)
        self._cancel_event = Event()

    async def _prepare_context(self, message_content: str, user_id: int) -> str:
        """
        Prepare knowledge context for the message. In this instance, knowledge refers
        to data sources uploaded by the user via the knowledge service
        """
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
        """
        Convert message images to bytes for providers
        """
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
                    message_image.image.seek(0)  # Start from beginning of file
                    images.append(message_image.image.read())
            except Exception as e:
                self.logger.error(f"Error processing image for message {message.id}: {str(e)}")
                continue
        return images

    def generate_response(self, data: dict, user) -> Generator[str, None, None]:
        """
        Generate streaming response for chat. Main entry point for chatting via
        the chat service
        """
        self._cancel_event.clear()
        generation_id = id(self)
        start = timer()

        try:
            # Try to get conversation or create new one if not provided
            # TODO: there is probably a better way to do this
            print("DATA", data)
            conversation = self.conversation_service.get_or_create_conversation(
                data.get("conversation_uuid"), {
                    "user": user,
                    "name": data.get("content", "New Conversation")[:50],
                }
            )

            # Send conversation UUID as first chunk
            yield json.dumps({"conversation_uuid": str(conversation.uuid), "status": "created"})

            try:
                validated_user = user if isinstance(user, int) else data.get("user")
                user = CustomUser.objects.get(id=validated_user)
            except CustomUser.DoesNotExist:
                yield json.dumps({"error": "User not found", "status": "error"})
                return

            try:
                images = data.get("images", [])
            except Exception as e:
                self.logger.error(f"Error processing images: {str(e)}")
                images = []

            # Create the user's message with conversation instance
            user_message = self.message_repository.create(
                conversation=conversation,
                content=data.get("content", ""),
                role="user",
                user=user,
                model=data.get("model", "llama3.2:3b"),
                images=images,
            )

            # Get the appropriate provider
            provider_name = data.get("provider")
            if provider_name:
                provider = self.provider_factory.get_provider(provider_name, user.id)
            else:
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
            for chunk in provider.stream(data.get("model", "llama3.2:3b"), formatted_messages, user_id=user.id, conversation_id=str(conversation.uuid)):
                if self._cancel_event.is_set():
                    full_content += " [cancelled]"
                    break
                if isinstance(chunk, str):
                    chunk_data = json.loads(chunk)
                    full_content += chunk_data.get("content", "")
                    tokens_generated += 1
                    yield json.dumps(chunk_data) + "\n"

            end = timer()
            generation_time = end - start
            
            print("FULL CONTENT", full_content)

            # Update final message content if not cancelled
            if not self._cancel_event.is_set():
                assistant_message = self.message_repository.create(
                    conversation=user_message.conversation,
                    content=full_content,
                    role="assistant",
                    user=user,
                    tokens_used=tokens_generated,
                    model=data.get("model"),
                    generation_time=generation_time,
                    finish_reason="cancelled" if self._cancel_event.is_set() else "stop",
                )

            yield json.dumps(
                {
                    "status": "cancelled" if self._cancel_event.is_set() else "done",
                    "message_id": str(assistant_message.id),
                }
            )

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
