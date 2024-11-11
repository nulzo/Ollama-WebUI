from typing import Union, List, AnyStr
from api.services.provider import BaseProvider
from django.conf import settings
from ollama import Client


class OllamaProvider(BaseProvider):
    def __init__(self) -> None:
        _ollama_host = settings.OLLAMA_HOST
        _ollama_port = settings.OLLAMA_PORT
        self._client = Client(host=f"http://{_ollama_host}:{_ollama_port}")
        print(self._client)
        super().__init__()

    def chat(self, model: str, messages: Union[List, AnyStr]):
        """
        Sends a message to the ollama service.
        """
        return self._client.chat(model=model, messages=messages, stream=True)

    def stream(self, model: str, messages: Union[List, AnyStr]):
        """
        Stream a response. in progress.
        """
        return self._client.chat(model=model, messages=messages, stream=True)

    def model(self): ...

    def models(self):
        return self._client.list()

    def generate(self): ...
