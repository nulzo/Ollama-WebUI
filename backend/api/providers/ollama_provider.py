import json
import logging
from typing import Optional, Union, List, AnyStr, Sequence, Literal

import httpx
from api.providers import BaseProvider
from django.conf import settings
from ollama import Client, Options, Message
from api.models.tools.tools import Tool
logger = logging.getLogger(__name__)

class OllamaProvider(BaseProvider):
    def __init__(self) -> None:
        _ollama_host = settings.OLLAMA_HOST
        _ollama_port = settings.OLLAMA_PORT
        self._client = Client(host=f"http://{_ollama_host}:{_ollama_port}")
        self.logger = logger
        super().__init__()

    def _prepare_tool_for_ollama(self, tool: Tool) -> dict:
        """Convert a Tool model instance to Ollama tool format"""
        return {
            'type': 'function',
            'function': {
                'name': tool.name,
                'description': tool.description,
                'parameters': tool.parameters,
            }
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
        stream: Literal[bool] = True
    ):
        """
        Sends a message to the ollama service.
        """
        self.logger.info(f"Sending message to ollama: {messages}")
        response = self._client.chat(
            model=model,
            messages=messages,
            options=options,
            stream=stream
        )
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
