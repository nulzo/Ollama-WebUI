import json
import logging
from typing import Optional, Union, List, AnyStr, Sequence
import httpx
from api.providers import BaseProvider
from django.conf import settings
from ollama import Client, Options, Message
from api.models.agent.tools import Tool
from dataclasses import dataclass

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

    def chat(
        self,
        model: str,
        messages: Union[Sequence[Message], None],
        options: Optional[Options] = None,
    ):
        """
        Sends a message to the ollama service without streaming.
        """
        self.logger.info(f"Sending message to ollama: {messages}")
        response = self._client.chat(model=model, messages=messages, options=options, stream=False)
        self.logger.info(f"Response from ollama: {response}")

        # Return the content directly for non-streaming response
        if isinstance(response, dict) and "message" in response:
            return response["message"]["content"]
        return response

    def stream(
        self,
        model: str,
        messages: Union[Sequence[Message], None],
        options: Optional[Options] = None,
    ):
        """
        Streams a response from the ollama service.
        """
        self.logger.info(f"Streaming message to ollama: {messages}")
        response = self._client.chat(model=model, messages=messages, options=options, stream=True)

        # Streaming response handling
        for chunk in response:
            if isinstance(chunk, bytes):
                chunk = chunk.decode("utf-8")
            if isinstance(chunk, dict) and "message" in chunk and "content" in chunk["message"]:
                yield chunk["message"]["content"]
            elif isinstance(chunk, str):
                yield chunk

    def model(self): ...

    def models(self):
        return self._client.list()

    def generate(self): ...
