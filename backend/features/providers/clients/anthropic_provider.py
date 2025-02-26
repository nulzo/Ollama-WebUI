import ast
import json
import logging
from timeit import default_timer as timer
from typing import Dict, List, Union, AsyncGenerator, Generator

from anthropic import Anthropic, AsyncAnthropic, BadRequestError

from features.analytics.services.analytics_service import AnalyticsEventService
from features.providers.clients.base_provider import BaseProvider
from api.utils.exceptions.exceptions import ServiceError

logger = logging.getLogger(__name__)


class AnthropicProvider(BaseProvider):
    def __init__(self, config: dict) -> None:
        print(f"Initializing AnthropicProvider with config: {config}")
        if not isinstance(config, dict):
            raise ValueError("Expected config to be a dict.")

        # Retrieve is_enabled flag and API key from configuration.
        self.is_enabled = config.get("is_enabled", False)
        api_key = config.get("api_key")
        if self.is_enabled and not api_key:
            raise ValueError("API key is required for AnthropicProvider when enabled.")

        # Save a copy of the configuration.
        self.config = config.copy()

        try:
            # Instantiate both synchronous and asynchronous Anthropic clients.
            self._client = Anthropic(api_key=api_key)
            self._client_aio = AsyncAnthropic(api_key=api_key)
        except Exception as e:
            raise ServiceError(f"Failed to initialize Anthropic client: {e}")

        self.logger = logger
        super().__init__(analytics_service=AnalyticsEventService())

    def _process_messages(self, messages: Union[List, str]) -> List[Dict]:
        """
        Process messages into Anthropic's expected format.
        Handles both text-only messages and messages with images.
        """
        if isinstance(messages, str):
            return [{"role": "user", "content": messages}]
        
        elif isinstance(messages, list):
            processed = []
            for msg in messages:
                if isinstance(msg, dict) and "role" in msg:
                    # Start with a basic message structure
                    processed_msg = {"role": msg["role"]}
                    
                    # Handle content and images
                    if "content" in msg:
                        # If there are images, we need to use content blocks
                        if "images" in msg and msg["images"] and len(msg["images"]) > 0:
                            content_blocks = []
                            
                            # Add text content as a block
                            if msg["content"]:
                                content_blocks.append({
                                    "type": "text",
                                    "text": msg["content"]
                                })
                            
                            # Add each image as a block
                            for image in msg["images"]:
                                if isinstance(image, bytes):
                                    import base64
                                    image_data = base64.b64encode(image).decode("utf-8")
                                elif isinstance(image, str):
                                    if "\\x" in image:
                                        # Handle escaped binary data
                                        image_bytes = bytes(image, "utf-8").decode("unicode_escape").encode("latin1")
                                        image_data = base64.b64encode(image_bytes).decode("utf-8")
                                    else:
                                        # Assume it's already base64 encoded
                                        image_data = image
                                else:
                                    # Skip invalid image data
                                    continue
                                    
                                # Add the image block in Anthropic's format
                                content_blocks.append({
                                    "type": "image",
                                    "source": {
                                        "type": "base64",
                                        "media_type": "image/jpeg",  # Assuming JPEG, adjust if needed
                                        "data": image_data
                                    }
                                })
                            
                            # Only set content blocks if we have at least one valid block
                            if content_blocks:
                                processed_msg["content"] = content_blocks
                            else:
                                # Fallback to text-only if no valid content blocks
                                processed_msg["content"] = msg["content"] or ""
                        else:
                            # No images, just use the content as is
                            processed_msg["content"] = msg["content"]
                    
                    processed.append(processed_msg)
                elif isinstance(msg, str):
                    processed.append({"role": "user", "content": msg})
                else:
                    processed.append({"role": "user", "content": str(msg)})
            
            return processed
        else:
            raise ValueError("Messages must be a list or a string.")

    def chat(self, model: str, messages: Union[List, str], max_tokens: int = 1024) -> str:
        """
        Synchronous method that generates a response from Anthropic.
        """
        if not self.is_enabled:
            raise ValueError("Anthropic Provider is not enabled.")

        processed_messages = self._process_messages(messages)

        try:
            response = self._client.messages.create(
                model=model,
                max_tokens=max_tokens,
                messages=processed_messages,
                stream=False
            )
            return response.content
        except Exception as e:
            self.logger.error(f"Error generating content with Anthropic: {e}")
            raise ServiceError(f"Failed to generate content: {e}")

    async def chat_stream(
        self, model: str, messages: Union[List, str], max_tokens: int = 1024
    ) -> AsyncGenerator[str, None]:
        """
        Asynchronous streaming method that generates a response from Anthropic.
        This method uses the async client and yields parts of the response as they are received.
        """
        if not self.is_enabled:
            raise ValueError("Anthropic Provider is not enabled.")

        processed_messages = self._process_messages(messages)

        try:
            # Request a streaming response by setting stream=True.
            stream = await self._client_aio.messages.create(
                model=model,
                max_tokens=max_tokens,
                messages=processed_messages,
                stream=True
            )
            # Iterate over streaming events and yield their content.
            async for event in stream:
                yield event.content
        except Exception as e:
            self.logger.error(f"Error streaming content with Anthropic: {e}")
            raise ServiceError(f"Streaming generation failed: {e}")

    def models(self) -> List[dict]:
        """
        Retrieve a list of available Anthropic models using the Anthropic SDK.
        Each model returned is represented as a standardized dictionary containing:
          - id: A unique model identifier with a provider suffix.
          - name: The display name (fallback to model id if missing).
          - model: The actual model id.
          - max_input_tokens: Maximum allowed input tokens.
          - max_output_tokens: Maximum allowed output tokens.
          - vision_enabled: Whether the model supports vision (default: False).
          - embedding_enabled: Whether the model supports embeddings (default: False).
          - tools_enabled: Whether the model supports tools (default: False).
          - provider: "anthropic"
        """
        if not self.is_enabled:
            self.logger.info("Anthropic provider is not enabled; skipping model retrieval.")
            return []
        try:
            results = []
            for model in list(self._client.models.list()):
                results.append({
                    "id": f"{model.id}-anthropic",
                    "name": model.display_name,
                    "model": model.id,
                    "max_input_tokens": 2048,
                    "max_output_tokens": 2048,
                    "vision_enabled": False,
                    "embedding_enabled": False,
                    "tools_enabled": False,
                    "provider": "anthropic",
                })
            return results
        except Exception as e:
            self.logger.error(f"Error fetching models from Anthropic: {e}")
            raise ServiceError(f"Failed to retrieve models: {e}")

    def update_config(self, config: Dict) -> None:
        """
        Update the provider's configuration.
        """
        new_api_key = config.get("api_key", self.config.get("api_key"))
        if new_api_key != self.config.get("api_key"):
            self.config["api_key"] = new_api_key
            try:
                self._client = Anthropic(api_key=new_api_key)
                self._client_aio = AsyncAnthropic(api_key=new_api_key)
                self.logger.info("Updated Anthropic client's API key.")
            except Exception as e:
                self.logger.error(f"Error updating API key for Anthropic: {e}")
                raise ServiceError(f"Failed to update API key: {e}")

        if "is_enabled" in config:
            self.is_enabled = config["is_enabled"]
            
    def calculate_cost(self, prompt: str, response: str) -> float:
        return 0.0

    def generate(self, model: str, messages: Union[List, str], max_tokens: int = 1024) -> str:
        return self.chat(model, messages, max_tokens)

    def stream(
        self,
        model: str,
        messages: Union[List, str],
        max_tokens: int = 1024,
        **kwargs
    ) -> Generator[str, None, None]:
        """
        Synchronous streaming method that generates a response from Anthropic.
        This method replicates the streaming behavior seen in Google, OpenAI, and Ollama.
        
        It yields JSON-formatted chunks:
          - Each intermediate chunk is wrapped as {"content": text, "status": "generating"}.
          - When a stop condition is detected, a final chunk is yielded as {"status": "done", "usage": token_usage}.
        
        Extra keyword arguments (e.g. user_id, conversation_id) are used to log analytics events.
        """
        if not self.is_enabled:
            raise ValueError("Anthropic Provider is not enabled.")

        processed_messages = self._process_messages(messages)
        token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        start_time = timer()
        try:
            # Request a streaming response using the synchronous client.
            stream_response = self._client.messages.create(
                model=model,
                max_tokens=max_tokens,
                messages=processed_messages,
                stream=True
            )
            done = False
            for event in stream_response:
                # Check for a stop condition.
                if getattr(event, "stop_reason", None):
                    # If the event contains usage info, update token usage.
                    if hasattr(event, "usage"):
                        usage = event.usage
                        if isinstance(usage, dict):
                            token_usage["prompt_tokens"] = usage.get("prompt_tokens", 0)
                            token_usage["completion_tokens"] = usage.get("completion_tokens", 0)
                        else:
                            token_usage["prompt_tokens"] = getattr(usage, "prompt_tokens", 0)
                            token_usage["completion_tokens"] = getattr(usage, "completion_tokens", 0)
                        token_usage["total_tokens"] = (
                            token_usage["prompt_tokens"] + token_usage["completion_tokens"]
                        )
                    # Log analytics if a user_id is provided.
                    if kwargs.get("user_id"):
                        generation_time = timer() - start_time
                        event_data = {
                            "user_id": kwargs.get("user_id"),
                            "event_type": "chat_completion",
                            "model": model,
                            "tokens": token_usage.get("total_tokens", 0),
                            "prompt_tokens": token_usage.get("prompt_tokens", 0),
                            "completion_tokens": token_usage.get("completion_tokens", 0),
                            "cost": self.calculate_cost("", model),
                            "metadata": {
                                "generation_time": generation_time,
                                "conversation_id": kwargs.get("conversation_id"),
                            },
                        }
                        self.log_chat_completion(event_data)
                    yield json.dumps({"status": "done", "usage": token_usage})
                    done = True
                    break

                # Otherwise, yield the generating chunk if there is any text.
                text = event.content
                if text and text.strip():
                    yield json.dumps({"content": text, "status": "generating"})

            # If we never encountered an explicit stop event, yield a final done message.
            if not done:
                if kwargs.get("user_id"):
                    generation_time = timer() - start_time
                    event_data = {
                        "user_id": kwargs.get("user_id"),
                        "event_type": "chat_completion",
                        "model": model,
                        "tokens": token_usage.get("total_tokens", 0),
                        "prompt_tokens": token_usage.get("prompt_tokens", 0),
                        "completion_tokens": token_usage.get("completion_tokens", 0),
                        "cost": self.calculate_cost("", model),
                        "metadata": {
                            "generation_time": generation_time,
                            "conversation_id": kwargs.get("conversation_id"),
                        },
                    }
                    self.log_chat_completion(event_data)
                yield json.dumps({"status": "done", "usage": token_usage})

        except BadRequestError as e:
            error_details = e.body.get('error', {})
            if kwargs.get("user_id"):
                event_data = {
                    "user_id": kwargs.get("user_id"),
                    "event_type": "error",
                    "model": model,
                    "tokens": token_usage.get("total_tokens", 0),
                    "prompt_tokens": token_usage.get("prompt_tokens", 0),
                    "completion_tokens": token_usage.get("completion_tokens", 0),
                    "cost": self.calculate_cost("", model),
                    "metadata": {"error": str(e)},
                }
                self.log_chat_completion(event_data)
            yield json.dumps({
                "error": str(e), 
                "status": "error",
                "error_code": e.status_code,
                "error_title": f"Anthropic Error: {error_details.get('type', 'Unknown Error')}",
                "error_description": error_details.get("message", "Unknown Error"),
            })
            return
        except Exception as e:
            generation_time = timer() - start_time
            self.logger.error(f"Error streaming content with Anthropic: {e}")
            print(f"Error details: {e.args, type(e)}")
            error_details = self._parse_anthropic_error(str(e))
            if kwargs.get("user_id"):
                event_data = {
                    "user_id": kwargs.get("user_id"),
                    "event_type": "error",
                    "model": model,
                    "tokens": token_usage.get("total_tokens", 0),
                    "prompt_tokens": token_usage.get("prompt_tokens", 0),
                    "completion_tokens": token_usage.get("completion_tokens", 0),
                    "cost": self.calculate_cost("", model),
                    "metadata": {"generation_time": generation_time, "error": str(e)},
                }
                self.log_chat_completion(event_data)
            yield json.dumps({
                "error": str(e), 
                "status": "error",
                "error_code": error_details.get("error_code"),
                "error_title": error_details.get("error_title"),
                "error_description": error_details.get("error_description"),
            })
    
    def _format_model_name(self, model_id: str) -> str:
        """
        Format the model name to be used in the UI.
        """
        return model_id.replace("claude-", "").replace("_", "")

    def _parse_anthropic_error(self, error_msg: str) -> dict:
        """
        Parse an Anthropic error string into a structured dictionary.
        
        Expected format (example):
            "Error code: 400 - {'type': 'error', 'error': {'type': 'invalid_request_error', 'message': 'Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.'}}"
        Returns a dict with keys:
            - error_code
            - error_title
            - error_description
        """
        try:
            # Split by the delimiter " - "
            prefix, details = error_msg.split(" - ", 1)
            # Extract error code by removing the label.
            error_code = prefix.replace("Error code:", "").strip()
            
            # Convert the string representation of the dict to an actual dictionary safely.
            error_body = ast.literal_eval(details)
            
            # The expected structure:
            # {'type': 'error', 'error': {'type': 'invalid_request_error', 'message': '...'}}
            inner_error = error_body.get("error", {})
            error_title = inner_error.get("type", "Anthropic API Error")
            error_description = inner_error.get("message", error_msg)
            
            return {
                "error_code": error_code,
                "error_title": error_title,
                "error_description": error_description,
            }
        except Exception as parse_ex:
            # In case parsing fails, return a fallback structure.
            return {
                "error_code": None,
                "error_title": "Anthropic API Error",
                "error_description": error_msg,
            }