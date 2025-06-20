import asyncio
import base64
from timeit import default_timer as timer
import json
import logging
import traceback
from threading import Event
from typing import Generator, List, Optional, Union
from features.completions.models import MessageError
from features.analytics.services.analytics_service import AnalyticsEventService
from features.conversations.services.conversation_service import ConversationService
from features.providers.clients.provider_factory import provider_factory, ProviderFactory
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
        
        # State tracking for cancellation
        self.current_user_message = None
        self.current_full_content = ""
        self.current_tokens_generated = 0
        self.current_generation_start = None
        self.current_request_data = None
        self.current_user = None

    def _prepare_context(self, message_content: str, user_id: int, knowledge_ids=None) -> str:
        """
        Prepare knowledge context for the message. In this instance, knowledge refers
        to data sources uploaded by the user via the knowledge service.
        
        If knowledge_ids are provided, fetch those specific documents.
        Otherwise, perform semantic search based on message content.
        """
        try:
            relevant_docs = []
            
            # If specific knowledge IDs are provided, fetch those documents
            if knowledge_ids and isinstance(knowledge_ids, list) and len(knowledge_ids) > 0:
                self.logger.info(f"Using specific knowledge documents: {knowledge_ids}")
                print(f"DEBUG: Processing knowledge_ids: {knowledge_ids}")
                
                for knowledge_id in knowledge_ids:
                    try:
                        # Ensure knowledge_id is a string
                        knowledge_id_str = str(knowledge_id)
                        print(f"DEBUG: Fetching knowledge document with ID: {knowledge_id_str}, user_id: {user_id}")
                        
                        # Get the knowledge document
                        knowledge = self.knowledge_service.get_knowledge(knowledge_id_str, user_id)
                        
                        if knowledge:
                            print(f"DEBUG: Found knowledge document: {knowledge.name}, content length: {len(knowledge.content)}")
                            
                            # Get chunks with citation information from ChromaDB
                            chunks = self.knowledge_service.get_chunks_for_knowledge(knowledge.id)
                            
                            if chunks and len(chunks) > 0:
                                print(f"DEBUG: Found {len(chunks)} chunks for knowledge document")
                                # Add each chunk as a separate document with citation
                                for chunk in chunks:
                                    relevant_docs.append({
                                        'content': chunk['content'],
                                        'metadata': {
                                            'name': knowledge.name,
                                            'identifier': knowledge.identifier,
                                            'citation': chunk.get('metadata', {}).get('citation', knowledge.name)
                                        },
                                        'similarity': 1.0  # Perfect match since explicitly selected
                                    })
                            else:
                                print(f"DEBUG: No chunks found, using entire document content")
                                # Fallback to using the entire document if no chunks are found
                                relevant_docs.append({
                                    'content': knowledge.content,
                                    'metadata': {
                                        'name': knowledge.name,
                                        'identifier': knowledge.identifier,
                                        'citation': knowledge.name
                                    },
                                    'similarity': 1.0  # Perfect match since explicitly selected
                                })
                        else:
                            print(f"DEBUG: Knowledge document with ID {knowledge_id} not found")
                    except Exception as e:
                        print(f"DEBUG: Error fetching knowledge {knowledge_id}: {str(e)}")
                        self.logger.warning(f"Error fetching knowledge {knowledge_id}: {str(e)}")
                        traceback.print_exc()
            else:
                # Otherwise perform semantic search
                print(f"DEBUG: No knowledge_ids provided, performing semantic search with query: {message_content[:50]}...")
                relevant_docs = self.knowledge_service.find_relevant_context(message_content, user_id)

            if not relevant_docs:
                print("DEBUG: No relevant documents found")
                return ""

            print(f"DEBUG: Found {len(relevant_docs)} relevant documents")
            
            # Format the context in a way that's optimized for LLMs
            context = "I'll provide you with some relevant information to help answer the user's question. " \
                      "Please use this information to inform your response and cite the sources when appropriate.\n\n"
            
            # Add each document with clear separation and citation information
            for i, doc in enumerate(relevant_docs):
                print(f"DEBUG: Document {i+1} content length: {len(doc['content'])}")
                citation = doc.get('metadata', {}).get('citation', f"Document {i+1}")
                source_name = doc.get('metadata', {}).get('name', f"Source {i+1}")
                
                # Add document with clear formatting
                context += f"SOURCE {i+1}: {source_name}\n"
                context += f"CITATION: {citation}\n"
                context += f"CONTENT:\n{doc['content']}\n\n"
            
            # Add instructions for the LLM
            context += "\nPlease use the above information to answer the user's question. " \
                       "If the information doesn't contain the answer, just say so - don't make up information. " \
                       "When using information from the sources, cite them using the citation format provided.\n\n"
            
            print(f"DEBUG: Final context length: {len(context)}")
            return context

        except Exception as e:
            print(f"DEBUG: Error in _prepare_context: {str(e)}")
            self.logger.error(f"Error preparing context: {str(e)}")
            traceback.print_exc()
            return ""

    def _process_message_images(self, message):
        """
        Convert message images to bytes for providers
        """
        if not message.has_images:
            return []

        images = []
        for message_image in message.message_images.all().order_by("created_at"):
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
        user_message = None
        assistant_message = None
        tokens_generated = 0
        full_content = ""
        relevant_chunks = []  # Track relevant chunks for citation
        
        # Reset state tracking variables
        self.current_user_message = None
        self.current_full_content = ""
        self.current_tokens_generated = 0
        self.current_generation_start = start
        self.current_request_data = data
        self.current_user = user

        try:
            # Try to get conversation or create new one if not provided
            # TODO: there is probably a better way to do this
            conversation = self.conversation_service.get_or_create_conversation(
                data.get("conversation_uuid"), {
                    "user": user,
                    "name": data.get("content", "New Conversation")[:50],
                }
            )

            # Send conversation UUID as first chunk
            yield json.dumps({"conversation_uuid": str(conversation.uuid), "status": "created"})

            if not isinstance(user, CustomUser):
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
                provider=data.get("provider", "ollama"),
                name = data.get("name", ""),
                user=user,
                model=data.get("model", "llama3.2:3b"),
                images=images,
            )
            
            # Update state tracking
            self.current_user_message = user_message

            # Get the appropriate provider
            provider_name, model_name = self._get_provider_name_and_model(data.get("model"))
            data['model'] = model_name

            if provider_name:
                provider = self.provider_factory.get_provider(provider_name, user.id)
            else:
                # Fallback or error handling
                self.logger.warning("Provider could not be determined from model ID. Falling back to default.")
                provider = self._get_provider(user.id) # Your existing default provider logic

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

            # Check if knowledge_ids are provided and prepare context
            knowledge_ids = data.get("knowledge_ids", [])
            if knowledge_ids and isinstance(knowledge_ids, list) and len(knowledge_ids) > 0:
                self.logger.info(f"Knowledge IDs provided: {knowledge_ids}")

                # Get the last user message (the one we just created)
                last_user_message = formatted_messages[-1]

                # Prepare context - use a thread to avoid blocking
                # This is a synchronous approach that doesn't use async/await
                context = self._prepare_context(
                    message_content=last_user_message["content"],
                    user_id=user.id,
                    knowledge_ids=knowledge_ids
                )
                
                if context:
                    # Add context to the user message
                    self.logger.info("Adding knowledge context to user message")
                    last_user_message["content"] = f"{last_user_message['content']}\n\n{context}"
                    # Update the formatted messages
                    formatted_messages[-1] = last_user_message
                    
                    # Store relevant chunks for citation
                    relevant_chunks = self.knowledge_service.find_relevant_context(
                        last_user_message["content"], 
                        user.id, 
                        max_results=5
                    )
                else:
                    print("DEBUG: No context was generated from knowledge documents")
            else:
                print(f"DEBUG: No knowledge_ids provided in request or invalid format: {knowledge_ids}")

            # Check if function calling is enabled for this request
            function_call = False
            if data.get("function_call") is True:
                self.logger.info("We finna call that tool")
                function_call = True

            # Stream the response
            try:
                for chunk in provider.stream(
                    data.get("model", "llama3.2:3b"), 
                    formatted_messages, 
                    user_id=user.id, 
                    conversation_id=str(conversation.uuid),
                    function_call=function_call
                ):
                    # Check if cancellation was requested
                    if self._cancel_event.is_set():
                        self.logger.info(f"Generation {generation_id} was cancelled after {tokens_generated} tokens")
                        print("CANCELLED")
                        full_content += " [cancelled]"
                        break

                    if isinstance(chunk, str):
                        chunk_data = json.loads(chunk)
                        
                        # If an error chunk is received, save an error message and yield the error response
                        if chunk_data.get("status") == "error":
                            error_message_text = chunk_data.get("error", "Unknown error")
                            full_content += f"\nError: {error_message_text}"
                            
                            assistant_message = self.message_repository.create(
                                conversation=user_message.conversation,
                                content=full_content,
                                role="assistant",
                                user=user,
                                tokens_used=tokens_generated,
                                provider=data.get("provider", "ollama"),
                                name=data.get("name", ""),
                                model=data.get("model"),
                                generation_time=timer() - start,
                                finish_reason="error",
                                is_error=True,
                                has_citations=False,
                                citations=None,
                            )
                            
                            print(f"chunk_data: {chunk_data}")
                            
                            MessageError.objects.create(
                                message=assistant_message,
                                error_code=chunk_data.get("error_code", "400"),
                                error_title=chunk_data.get("error_title", "Generation Error"),
                                error_description=chunk_data.get("error_description", error_message_text)
                            )
                            
                            yield json.dumps({
                                "error": error_message_text,
                                "status": "error",
                                "message_id": str(assistant_message.id),
                                "is_error": True,
                            }) + "\n"
                            return
                        
                        # Handle tool calls
                        if chunk_data.get("status") == "tool_call":
                            # Pass through the tool call data
                            yield json.dumps(chunk_data) + "\n"
                            
                            # Add tool call information to the full content
                            tool_calls = chunk_data.get("tool_calls", [])
                            tool_results = chunk_data.get("tool_results", [])
                            
                            for i, tool_call in enumerate(tool_calls):
                                function_name = tool_call.get("function", {}).get("name", "unknown")
                                arguments = tool_call.get("function", {}).get("arguments", "{}")
                                
                                # Find corresponding result
                                result = "No result"
                                for result_item in tool_results:
                                    if result_item.get("tool_call_id") == tool_call.get("id"):
                                        if "result" in result_item:
                                            result = result_item.get("result")
                                        elif "error" in result_item:
                                            result = f"Error: {result_item.get('error')}"
                                
                                # Add to full content
                                full_content += f"\n\nFunction Call: {function_name}({arguments})\nResult: {result}\n\n"
                            
                            # Store tool calls and results for later use when creating the message
                            if not hasattr(self, '_tool_calls'):
                                self._tool_calls = []
                                self._tool_results = []
                            
                            self._tool_calls.extend(tool_calls)
                            self._tool_results.extend(tool_results)
                            
                            continue
                        
                        full_content += chunk_data.get("content", "")
                        tokens_generated += 1

                        # Update state tracking
                        self.current_full_content = full_content
                        self.current_tokens_generated = tokens_generated

                        yield json.dumps(chunk_data) + "\n"
            except Exception as stream_error:
                self.logger.error(f"Error during streaming: {str(stream_error)}")
                full_content += f"\nError: {str(stream_error)}"
                # Let the outer exception handler deal with this

            end = timer()
            generation_time = end - start

            # Process citations if we have relevant chunks
            citation_data = {}
            if relevant_chunks:
                self.logger.info(f"Processing citations for {len(relevant_chunks)} relevant chunks")
                
                citation_data = self.knowledge_service.get_citations_for_response(full_content, relevant_chunks)
                self.logger.info(f"Generated {len(citation_data.get('citations', []))} citations for response")

            # Create the assistant message regardless of how we got here
            # This ensures cancelled messages are saved
            if not assistant_message:  # Only create if not already created due to error
                finish_reason = "cancelled" if self._cancel_event.is_set() else "stop"
                
                # Get tool calls and results if they exist
                tool_calls = getattr(self, '_tool_calls', [])
                tool_results = getattr(self, '_tool_results', [])
                has_tool_calls = len(tool_calls) > 0
                
                # Create message with citation data and tool calls
                assistant_message = self.message_repository.create(
                    conversation=user_message.conversation,
                    content=full_content,
                    role="assistant",
                    user=user,
                    tokens_used=tokens_generated,
                    provider=data.get("provider", "ollama"),
                    name=data.get("name", ""),
                    model=data.get("model"),
                    generation_time=generation_time,
                    finish_reason=finish_reason,
                    is_error=False,
                    # Add citation data as JSON fields
                    has_citations=citation_data.get("has_citations", False),
                    citations=citation_data.get("citations", []),
                    # Add tool call data
                    tool_calls=tool_calls,
                    tool_results=tool_results,
                    has_tool_calls=has_tool_calls,
                )
                
                # Reset tool calls and results
                if hasattr(self, '_tool_calls'):
                    delattr(self, '_tool_calls')
                if hasattr(self, '_tool_results'):
                    delattr(self, '_tool_results')

            # If we were cancelled, send a final cancellation message
            if self._cancel_event.is_set():
                yield json.dumps({
                    "status": "cancelled",
                    "message_id": str(assistant_message.id),
                }) + "\n"
            else:
                # Include citation data in the final response
                yield json.dumps({
                    "status": "done",
                    "message_id": str(assistant_message.id),
                    "has_citations": citation_data.get("has_citations", False),
                    "citations": citation_data.get("citations", []),
                }) + "\n"

        except Exception as e:
            logger.error(f"Error in generation {generation_id}: {str(e)}\n{traceback.format_exc()}")
            try:
                # Only create error message if we have a user message and no assistant message yet
                if user_message and not assistant_message:
                    assistant_message = self.message_repository.create(
                        conversation=user_message.conversation,
                        content=full_content + "\nError: " + str(e),
                        role="assistant",
                        user=user,
                        tokens_used=tokens_generated,
                        provider=data.get("provider", "ollama"),
                        name=data.get("name", ""),
                        model=data.get("model"),
                        generation_time=timer() - start,
                        finish_reason="error",
                        is_error=True,
                        has_citations=False,
                        citations=None,
                    )
                    
                    MessageError.objects.create(
                        message=assistant_message,
                        error_code="400",  # Replace with an actual dynamic error code if available
                        error_title="Generation Error",
                        error_description=str(e)
                    )
                            
                    yield json.dumps({
                        "error": str(e),
                        "status": "error",
                        "message_id": str(assistant_message.id),
                        "is_error": True,
                    }) + "\n"
                    
            except Exception as db_error:
                self.logger.error(f"Error saving error message to DB: {str(db_error)}")
                yield json.dumps({
                    "error": str(e),
                    "status": "error",
                    "is_error": True,
                }) + "\n"

    def get_prompts(
        self, model_name: str, style: str = "", count: int = 5, user_id: int = None
    ) -> dict:
        """
        Get prompts based on model, style, and count
        """
        try:
            self.logger.info(f"Getting prompts with model: {model_name}, style: {style}, count: {count}, user_id: {user_id}")
            print(f"DEBUG: ChatService.get_prompts called with model: {model_name}")
            
            # Initialize provider
            provider_name = None
            model_id = model_name
            if model_id:
                # The model id is expected to be in the format 'model-name-provider'
                parts = model_id.split('-')
                if len(parts) > 1:
                    potential_provider = parts[-1]
                    if potential_provider in ['openai', 'ollama', 'google', 'anthropic', 'openrouter']:
                        provider_name = potential_provider
                        model_name = '-'.join(parts[:-1])

            if provider_name:
                provider = self.provider_factory.get_provider(provider_name, user_id)
            else:
                provider = self.provider_factory.get_provider('ollama', user_id)

            self.logger.info(f"Provider initialized: {provider}")

            # Initialize prompt service with provider
            prompt_service = PromptService(
                template_service=PromptTemplateService(),
                variant_service=PromptVariantService(),
                builder_service=PromptBuilderService(),
                provider=provider,
            )
            self.logger.info(f"Prompt service initialized")

            # Get prompts with the specified model - ensure we're using the correct model
            self.logger.info(f"Calling prompt_service.get_actionable_prompts with style: {style}, model: {model_name}")
            print(f"DEBUG: Calling prompt_service.get_actionable_prompts with model: {model_name}")
            prompts = prompt_service.get_actionable_prompts(style, model_name)

            # Limit prompts to requested count
            limited_prompts = prompts[:count] if count else prompts
            self.logger.info(f"Generated {len(limited_prompts)} prompts using model: {model_name}")

            return {"prompts": limited_prompts}

        except Exception as e:
            self.logger.error(f"Error generating prompts: {str(e)}")
            raise

    def cancel_generation(self):
        """Mark the current generation as cancelled"""
        self._cancel_event.set()

    def save_cancelled_message(self, user_message, full_content, tokens_generated, data, user, start_time):
        """
        Save a cancelled message to the database.
        This is called directly when a client disconnects to ensure the message is saved.
        """
        try:
            if not user_message:
                self.logger.warning("Cannot save cancelled message: No user message provided")
                return None
                
            # Add cancelled marker to content
            if not full_content.endswith(" [cancelled]"):
                full_content += " [cancelled]"
                
            generation_time = timer() - start_time
            
            # Create the assistant message with cancelled status
            assistant_message = self.message_repository.create(
                conversation=user_message.conversation,
                content=full_content,
                role="assistant",
                user=user,
                tokens_used=tokens_generated,
                provider=data.get("provider", "ollama"),
                name=data.get("name", ""),
                model=data.get("model"),
                generation_time=generation_time,
                finish_reason="cancelled",
                is_error=False,
                has_citations=False,
                citations=None,
            )
            
            self.logger.info(f"Saved cancelled message with ID: {assistant_message.id}")
            return assistant_message
        except Exception as e:
            self.logger.error(f"Error saving cancelled message: {str(e)}")
            return None

    def _get_provider_name_and_model(self, model_id: str) -> (str, str):
        """
        Helper to extract provider and model name from a composite model ID.
        E.g., "llama-3.1-70b-ollama" -> ("ollama", "llama-3.1-70b")
        """
        if model_id.endswith("-openrouter"):
            return "openrouter", model_id.replace("-openrouter", "")
        
        parts = model_id.split('-')
        if len(parts) > 1:
            provider_candidate = parts[-1]
            # Check if the last part is a known provider. If so, treat it as the provider.
            # This is a bit of a heuristic and might need refinement.
            # A more robust solution would be to have the frontend pass the provider explicitly.
            from features.providers.registry import provider_registry
            if provider_registry.is_provider_registered(provider_candidate):
                model_name = '-'.join(parts[:-1])
                return provider_candidate, model_name

        # Default case if no provider is appended or detected
        return "ollama", model_id
