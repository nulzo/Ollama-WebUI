import os
from ollama import Client
from typing import Union, List, Dict, Any


class OllamaService:
    def __init__(self):
        _ollama_host = os.getenv('OLLAMA_HOST', 'localhost')
        _ollama_port = os.getenv('OLLAMA_PORT', '11434')
        self._client = Client(host=f"http://{_ollama_host}:{_ollama_port}")

    def create_message_context(self, role: str, messages: Union[List, str]):
        return [{"role": role, "content": messages}]

    def chat(self, model: str, messages: Dict[Any, Any]):
        return self._client.chat(model=model, messages=messages, stream=True)

    def get_all_models(self):
        return self._client.list()


ollama_service = OllamaService()
