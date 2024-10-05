import os
from ollama import Client
from typing import Union, List, Dict, Any
from django.conf import settings


class OllamaService:
    def __init__(self):
        _ollama_host = settings.OLLAMA_URL
        _ollama_port = settings.OLLAMA_PORT
        print(f"OLLAMA_URL: {_ollama_host}")
        print(f"OLLAMA_PORT: {_ollama_port}")
        self._client = Client(host=f"http://{_ollama_host}:{_ollama_port}")

    def create_message_context(self, role: str, messages: Union[List, str]):
        return [{"role": role, "content": messages}]

    def chat(self, model: str, messages: Dict[Any, Any]):
        return self._client.chat(model=model, messages=messages, stream=True)

    def get_all_models(self):
        return self._client.list()


ollama_service = OllamaService()
