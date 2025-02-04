import base64
import json
import logging
from dataclasses import dataclass
from threading import Event
from timeit import default_timer as timer
from typing import AnyStr, Dict, Generator, List, Optional, Union

from features.analytics.services.analytics_service import AnalyticsService
import httpx
from django.conf import settings
from ollama import Client, Options

from features.tools.models import Tool
from features.providers.clients.base_provider import BaseProvider
from api.utils.exceptions.exceptions import ServiceError

logger = logging.getLogger(__name__)


@dataclass
class OllamaConfig:
    """Configuration for Ollama provider"""

    endpoint: str

    @classmethod
    def from_settings(cls) -> "OllamaConfig":
        """Create config from Django settings"""
        return cls(endpoint=settings.OLLAMA_ENDPOINT)

    @classmethod
    def from_endpoint(cls, endpoint: str) -> "OllamaConfig":
        """Create config from endpoint URL"""
        return cls(endpoint=endpoint)

    @property
    def endpoint(self) -> str:
        """Get full endpoint URL"""
        return self._endpoint

    @endpoint.setter
    def endpoint(self, value: str) -> None:
        """Set endpoint URL, ensuring it has a scheme"""
        if not value.startswith(("http://", "https://")):
            value = f"http://{value}"
        self._endpoint = value


class OllamaProvider(BaseProvider):
    def __init__(self) -> None:
        self.config = OllamaConfig.from_settings()
        self._client = Client(host=self.config.endpoint)
        self._cancel_event = Event()
        self.logger = logger
        super().__init__(analytics_service=AnalyticsService())

    def update_config(self, config: dict) -> None:
        """Update provider configuration"""
        if "endpoint" in config:
            new_config = OllamaConfig.from_endpoint(config["endpoint"])
            if new_config.endpoint != self.config.endpoint:
                self.config = new_config
                self._client = Client(host=self.config.endpoint)
                self.logger.info(f"Updated Ollama client with new endpoint: {self.config.endpoint}")

    def _prepare_tool_for_ollama(self, tool: Tool) -> dict:
        """Convert a Tool model instance to Ollama tool format"""
        return {
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters,
            },
        }

    async def achat(self, model: str, messages: Union[List, AnyStr]):
        """
        Async version of chat that yields responses
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"http://{self._ollama_host}:{self._ollama_port}/api/chat",
                json={"model": model, "messages": messages, "stream": True},
                timeout=None,
            )
            async for line in response.aiter_lines():
                if line:
                    try:
                        chunk = json.loads(line)
                        if "message" in chunk and "content" in chunk["message"]:
                            yield chunk["message"]["content"]
                    except json.JSONDecodeError:
                        continue

    def chat(
        self,
        messages: List[Dict],
        model: str,
        tools: Optional[List[Tool]] = None,
        stream: bool = False,
        **kwargs,
    ):
        """
        Send a chat request to Ollama with optional function calling

        Args:
            messages: List of chat messages
            model: Name of the model to use
            tools: Optional list of Tool objects for function calling
            stream: Whether to stream the response
            **kwargs: Additional arguments for Ollama
        """
        try:
            # Only prepare tools if they are provided
            # if tools:
            #     self.logger.debug(f"Preparing {len(tools)} tools for chat")
            #     kwargs["tools"] = self.tool_service.prepare_tools_for_ollama(tools)

            # Make the chat request
            response = self._client.chat(model=model, messages=messages, stream=stream)

            print(response)

            # For streaming responses, return directly
            if stream:
                return response

            # Handle tool calls if present in non-streaming response
            if isinstance(response, dict) and "message" in response:
                message = response["message"]

                # Only process tool calls if tools were provided
                if tools and "tool_calls" in message:
                    self.logger.debug("Processing tool calls from response")
                    # Execute tools and get results
                    tool_results = self.tool_service.handle_tool_call(
                        message["tool_calls"], kwargs.get("user")
                    )

                    # Add results to messages
                    messages.extend(
                        [
                            {
                                "role": "assistant",
                                "content": message["content"],
                                "tool_calls": message["tool_calls"],
                            },
                            {"role": "tool", "content": json.dumps(tool_results)},
                        ]
                    )

                    # Make another request with tool results
                    return self.chat(
                        messages=messages,
                        model=model,
                        tools=tools,
                        stream=stream,
                        **kwargs
                    )

                return message["content"]
            print(response)
            return response

        except Exception as e:
            self.logger.error(f"Error in Ollama chat: {str(e)}")
            raise ServiceError(f"Ollama chat failed: {str(e)}")

    def stream(
        self, model: str, messages: list, options: Optional[Options] = None, user_id: Optional[int] = None, conversation_id: Optional[str] = None
    ) -> Generator[str, None, None]:
        """
        Streams a response from the ollama service.
        """
        self._cancel_event.clear()
        start_time = timer()
        self.logger.info(f"Starting Ollama stream for model: {model}")
        generation_id = id(self)
        token_usage = {
            'prompt_tokens': 0,
            'completion_tokens': 0,
            'total_tokens': 0
        }

        try:
            # Process messages to ensure images are in correct format
            processed_messages = []
            for msg in messages:
                processed_msg = {
                    'role': msg['role'],
                    'content': msg['content']
                }
                
                if 'images' in msg and msg['images']:
                    # Convert bytes to base64 if needed
                    base64_images = []
                    for img in msg['images']:
                        if isinstance(img, bytes):
                            # If it's already bytes, encode to base64
                            base64_images.append(base64.b64encode(img).decode('utf-8'))
                        elif isinstance(img, str):
                            # If it's a base64 string, remove data URI prefix if present
                            if img.startswith('data:'):
                                base64_images.append(img.split(',')[1])
                            else:
                                base64_images.append(img)
                    processed_msg['images'] = base64_images
                
                processed_messages.append(processed_msg)
                
            response = self._client.chat(
                model=model,
                messages=processed_messages,
                options=options,
                stream=True
            )
            
            for chunk in response:
                if self._cancel_event.is_set():
                    self.logger.info(f"Generation {generation_id} was cancelled after {tokens_generated} tokens")
                    generation_time = timer() - start_time
                    self.log_chat_completion(
                        model=model,
                        messages=messages,
                        token_usage=token_usage,
                        user_id=user_id,
                        conversation_id=conversation_id,
                        generation_time=generation_time,
                        metadata={"cancelled": True}
                    )
                    yield json.dumps({
                        'content': ' [Generation cancelled]',
                        'status': 'cancelled',
                        'usage': token_usage
                    })
                    return

                if 'message' in chunk and 'content' in chunk['message']:
                    content = chunk['message']['content']
                    token_usage['completion_tokens'] += 1
                    token_usage['total_tokens'] += 1
                    yield json.dumps({
                        'content': content,
                        'status': 'generating'
                    })

                if chunk.get('done'):
                    token_usage.update({
                        'prompt_tokens': chunk.get('prompt_eval_count', 0),
                        'completion_tokens': chunk.get('eval_count', 0),
                        'total_tokens': (chunk.get('prompt_eval_count', 0) + 
                                    chunk.get('eval_count', 0))
                    })
                    
                    generation_time = timer() - start_time
                    self.log_chat_completion(
                        model=model,
                        messages=messages,
                        token_usage=token_usage,
                        user_id=user_id,
                        conversation_id=conversation_id,
                        generation_time=generation_time
                    )
                    
                    yield json.dumps({
                        'status': 'done',
                        'usage': token_usage
                    })

        except Exception as e:
            self.logger.error(f"Error in generation {generation_id}: {str(e)}")
            generation_time = timer() - start_time
            self.log_chat_completion(
                model=model,
                messages=messages,
                token_usage=token_usage,
                user_id=user_id,
                conversation_id=conversation_id,
                generation_time=generation_time,
                error=str(e)
            )
            yield json.dumps({
                'error': str(e),
                'status': 'error'
            })
        finally:
            self.logger.info(f"Generation {generation_id} completed with {token_usage} tokens generated")

    def model(self): ...

    def models(self):
        return self._client.list()

    def generate(self): ...

    def calculate_cost(self, tokens: Dict[str, int], model: str) -> float:
        """
        Calculate cost for Ollama models (always 0 as they're run locally)
        """
        prompt_tokens = tokens.get('prompt_tokens', 0)
        completion_tokens = tokens.get('completion_tokens', 0)
        
        self.logger.debug(
            f"Ollama token usage for {model}: "
            f"prompt_tokens={prompt_tokens}, "
            f"completion_tokens={completion_tokens}, "
            f"total={prompt_tokens + completion_tokens}, "
            f"cost=$0.00 (local model)"
        )
        
        return 0.0