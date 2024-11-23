import base64
from typing import Union, List, AnyStr
from api.providers import BaseProvider
from django.conf import settings
from openai import Client
import logging

logger = logging.getLogger(__name__)


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
        processed_messages = []
        for message in messages:
            processed_message = {"role": message["role"], "content": []}
            
            # Handle text content
            if message.get("content"):
                processed_message["content"].append({
                    "type": "text",
                    "text": message["content"]
                })
            
            # Handle images - using list comprehension for better performance
            if message.get("images"):
                for image in message["images"]:
                    # Process the image data
                    if isinstance(image, bytes):
                        image_data = base64.b64encode(image).decode('utf-8')
                    elif isinstance(image, str) and "\\x" in image:
                        image_bytes = bytes(image, 'utf-8').decode('unicode_escape').encode('latin1')
                        image_data = base64.b64encode(image_bytes).decode('utf-8')
                    else:
                        image_data = image

                    # Add the processed image to the message
                    processed_message["content"].append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_data}"
                        }
                    })
                
                processed_messages.append(processed_message)
        
        # Configure the streaming response for better performance
        response = self._client.chat.completions.create(
            model=model,
            messages=processed_messages,
            stream=True,
            max_tokens=150,  # Adjust based on your needs
            temperature=0.7,
            presence_penalty=0,
            frequency_penalty=0
        )

        buffer = ""
        for chunk in response:
            if chunk.choices[0].delta.content:
                buffer += chunk.choices[0].delta.content
                # Only yield when we have a reasonable chunk size or hit punctuation
                if len(buffer) >= 4 or any(p in buffer for p in '.!?,\n'):
                    yield buffer
                    buffer = ""
        
        # Yield any remaining content
        if buffer:
            yield buffer

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
