from ollama import Client
from typing import Union, List, Dict, Any


class OllamaService:
    def __init__(self):
        self._client = Client(host="http://192.168.0.25:11434")

    def create_message_context(self, role: str, messages: Union[List, str]):
        return [{"role": role, "content": messages}]

    def chat(self, model: str, messages: Dict[Any, Any]):
        return self._client.chat(model=model, messages=messages, stream=True)

    def get_all_models(self):
        return self._client.list()


ollama_service = OllamaService()
