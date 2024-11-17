from typing import Union, List, AnyStr
from api.services.provider import BaseProvider
from django.conf import settings
from openai import Client


class OpenAiProvider(BaseProvider):
    def __init__(self) -> None:
        _openai_host = settings.OPENAI_HOST
        _api_key = settings.OPENAI_API_KEY
        self._client = Client(api_key=_api_key)
        super().__init__()

    def chat(self, model: str, messages: Union[List, AnyStr]):
        """
        Sends a message to the OpenAI service with streaming.
        """
        response = self._client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True
        )
        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content

    def stream(self, model: str, messages: Union[List, AnyStr]):
        """
        Stream a response. in progress.
        """
        response = self._client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True
        )
        full_content = ""
        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                full_content += chunk.choices[0].delta.content
                yield {"message": {"role": "assistant", "content": full_content}, "done": False}
            if chunk.choices[0].finish_reason:
                yield {"message": {"role": "assistant", "content": full_content}, "done": True}

    def model(self): ...

    def models(self):
        return self._client.models.list()

    def generate(self): ...
