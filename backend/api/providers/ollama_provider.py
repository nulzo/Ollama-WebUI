import json
import logging
from typing import Optional, Union, List, AnyStr, Sequence, Literal
import httpx
from api.providers import BaseProvider
from django.conf import settings
from ollama import Client, Options, Message
from api.models.tools.tools import Tool
from dataclasses import dataclass
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


@dataclass
class OllamaConfig:
    """Configuration for Ollama provider"""

    host: str
    port: str

    @classmethod
    def from_settings(cls) -> "OllamaConfig":
        """Create config from Django settings"""
        return cls(host=settings.OLLAMA_HOST, port=settings.OLLAMA_PORT)

    @classmethod
    def from_endpoint(cls, endpoint: str) -> "OllamaConfig":
        """Create config from endpoint URL"""
        parsed = urlparse(endpoint)
        # Handle cases where scheme is missing
        if not parsed.scheme:
            parsed = urlparse(f"http://{endpoint}")

        host = parsed.hostname or settings.OLLAMA_HOST
        port = str(parsed.port) if parsed.port else settings.OLLAMA_PORT

        return cls(host=host, port=port)

    @property
    def endpoint(self) -> str:
        """Get full endpoint URL"""
        return f"http://{self.host}:{self.port}"


class OllamaProvider(BaseProvider):
    def __init__(self) -> None:
        self.config = OllamaConfig.from_settings()
        self._client = Client(host=self.config.endpoint)
        self.logger = logger
        super().__init__()

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

    def slow_chat(self, model: str, messages: Union[List, AnyStr]):
        self.logger.info(f"Sending message to ollama: {messages}")
        response = self._client.chat(model=model, messages=messages, stream=False)
        self.logger.info(f"Response from ollama: {response}")
        return response

    def chat(
        self,
        model: str,
        messages: Union[Sequence[Message], None],
        options: Optional[Options] = None,
        stream: Literal[bool] = True,
    ):
        """
        Sends a message to the ollama service.
        """
        self.logger.info(f"Sending message to ollama: {messages}")
        response = self._client.chat(model=model, messages=messages, options=options, stream=stream)
        self.logger.info(f"Response from ollama: {response}")
        if not stream:
            # For non-streaming, collect the entire response
            print(response)
            if isinstance(response, (str, dict)):
                return response["message"]["content"]

            # If it's a generator, consume it and join the results
            try:
                full_response = "".join(chunk for chunk in response)
                return full_response
            except Exception as e:
                self.logger.error(f"Error consuming response: {str(e)}")
                raise

        # Streaming response handling
        for chunk in response:
            if isinstance(chunk, bytes):
                chunk = chunk.decode("utf-8")
            if isinstance(chunk, dict) and "message" in chunk and "content" in chunk["message"]:
                yield chunk["message"]["content"]
            elif isinstance(chunk, str):
                yield chunk

    def stream(self, model: str, messages: Union[List, AnyStr]):
        """
        Stream a response. in progress.
        """
        return self._client.chat(model=model, messages=messages, stream=True)

    def model(self): ...

    def models(self):
        return self._client.list()

    def generate(self): ...
