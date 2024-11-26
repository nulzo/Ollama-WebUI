import json
from typing import Optional, Union, List, AnyStr

import httpx
from api.providers import BaseProvider
from django.conf import settings
from ollama import Client, Options


class OllamaProvider(BaseProvider):
    def __init__(self) -> None:
        _ollama_host = settings.OLLAMA_HOST
        _ollama_port = settings.OLLAMA_PORT
        self._client = Client(host=f"http://{_ollama_host}:{_ollama_port}")
        print(self._client)
        super().__init__()

    async def achat(self, model: str, messages: Union[List, AnyStr]):
        """
        Async version of chat that yields responses
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"http://{self._ollama_host}:{self._ollama_port}/api/chat",
                json={"model": model, "messages": messages, "stream": True},
                timeout=None
            )
            async for line in response.aiter_lines():
                if line:
                    try:
                        chunk = json.loads(line)
                        if 'message' in chunk and 'content' in chunk['message']:
                            yield chunk['message']['content']
                    except json.JSONDecodeError:
                        continue

    def chat(self, model: str, messages: Union[List, AnyStr], options: Optional[Options] = None):
        """
        Sends a message to the ollama service.
        """
        response = self._client.chat(
            model=model,
            messages=messages,
            options=options,
            stream=True
        )
        for chunk in response:
            if isinstance(chunk, bytes):
                chunk = chunk.decode('utf-8')
            if isinstance(chunk, dict) and 'message' in chunk and 'content' in chunk['message']:
                yield chunk['message']['content']  # Return just the content string
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
