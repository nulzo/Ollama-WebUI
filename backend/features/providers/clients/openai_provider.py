import base64
import logging
from typing import AnyStr, Dict, List, Union

from django.conf import settings
from openai import Client
import json

from features.providers.clients.base_provider import BaseProvider

logger = logging.getLogger(__name__)


class OpenAiProvider(BaseProvider):
    def __init__(self) -> None:
        # _openai_host = settings.OPENAI_HOST
        _api_key = settings.OPENAI_API_KEY
        self._client = Client(api_key=_api_key)
        super().__init__()

    def chat(self, model: str, messages: Union[List, AnyStr]):
        """
        Sends a message to the OpenAI service without streaming.
        """
        processed_messages = self._process_messages(messages)

        response = self._client.chat.completions.create(
            model=model, messages=processed_messages, stream=False
        )

        return response.choices[0].message.content

    def stream(self, model: str, messages: Union[List, AnyStr]):
        """
        Streams a response from the OpenAI service.
        """
        processed_messages = self._process_messages(messages)
        
        if not processed_messages:
            raise ValueError("Messages array cannot be empty")

        response = self._client.chat.completions.create(
            model=model,
            messages=processed_messages,
            stream=True
        )

        buffer = ""
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                buffer += content
                if len(buffer) >= 4 or any(p in buffer for p in ".!?,\n"):
                    yield json.dumps({
                        "content": buffer,
                        "status": "generating"
                    })
                    buffer = ""

        if buffer:
            yield json.dumps({
                "content": buffer,
                "status": "generating"
            })

    def _process_messages(self, messages: Union[List, AnyStr]) -> List[Dict]:
        """
        Process messages into OpenAI's expected format.
        """
        processed_messages = []
        for message in messages:
            # Skip empty messages
            if not message.get("content") and not message.get("images"):
                continue
                
            processed_message = {
                "role": message["role"],
                "content": []
            }

            # Handle text content
            if message.get("content"):
                if isinstance(message["content"], str):
                    processed_message["content"] = message["content"]
                else:
                    # For multimodal messages, format as list of content parts
                    processed_message["content"] = [{"type": "text", "text": message["content"]}]

            # Handle images if present
            if message.get("images"):
                if not isinstance(processed_message["content"], list):
                    processed_message["content"] = [{"type": "text", "text": processed_message["content"]}]
                
                for image in message["images"]:
                    if isinstance(image, bytes):
                        image_data = base64.b64encode(image).decode("utf-8")
                    elif isinstance(image, str):
                        if "\\x" in image:
                            image_bytes = bytes(image, "utf-8").decode("unicode_escape").encode("latin1")
                            image_data = base64.b64encode(image_bytes).decode("utf-8")
                        else:
                            image_data = image

                    processed_message["content"].append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}"
                        }
                    })

            processed_messages.append(processed_message)

        return processed_messages

    def models(self):
        return self._client.models.list()

    def model(self): ...

    def models(self):
        return self._client.models.list()

    def generate(self): ...
