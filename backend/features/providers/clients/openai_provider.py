import base64
import logging
from typing import AnyStr, Dict, List, Optional, Union
from timeit import default_timer as timer

from django.conf import settings
from openai import Client
import json

from features.providers.clients.base_provider import BaseProvider
from features.analytics.services.analytics_service import AnalyticsService
logger = logging.getLogger(__name__)


class OpenAiProvider(BaseProvider):
    def __init__(self) -> None:
        # _openai_host = settings.OPENAI_HOST
        _api_key = settings.OPENAI_API_KEY
        self._client = Client(api_key=_api_key)
        super().__init__(analytics_service=AnalyticsService())

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
        start_time = timer()

        processed_messages = self._process_messages(messages)
        
        if not processed_messages:
            raise ValueError("Messages array cannot be empty")
        
        token_usage = {
            'prompt_tokens': 0,
            'completion_tokens': 0,
            'total_tokens': 0
        }

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
            
            # OpenAI provides usage info in the last chunk
            if hasattr(chunk, 'usage'):
                token_usage.update(chunk.usage)
                print(token_usage)

        if buffer:
            yield json.dumps({
                "content": buffer,
                "status": "generating"
            })
        
        generation_time = timer() - start_time
        # self.log_chat_completion(
        #     model=model,
        #     messages=messages,
        #     token_usage=token_usage,
        #     user_id=user_id,
        #     conversation_id=conversation_id,
        #     generation_time=generation_time
        # )

        # Send final usage statistics
        yield json.dumps({
            "status": "done",
            "usage": token_usage
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

    def calculate_cost(self, tokens: Dict[str, int], model: str) -> float:
        """
        Calculate cost based on OpenAI's pricing
        https://openai.com/api/pricing/
        """
        costs = {
            # GPT-4 Turbo
            'gpt-4-0125-preview': {
                'prompt': 0.01,    # $0.01 per 1K prompt tokens
                'completion': 0.03  # $0.03 per 1K completion tokens
            },
            # GPT-4 Vision
            'gpt-4-vision-preview': {
                'prompt': 0.01,
                'completion': 0.03
            },
            # GPT-4
            'gpt-4': {
                'prompt': 0.03,
                'completion': 0.06
            },
            'gpt-4-32k': {
                'prompt': 0.06,
                'completion': 0.12
            },
            # GPT-3.5 Turbo
            'gpt-3.5-turbo-0125': {
                'prompt': 0.0005,
                'completion': 0.0015
            },
            'gpt-3.5-turbo': {
                'prompt': 0.0005,
                'completion': 0.0015
            },
            'gpt-3.5-turbo-16k': {
                'prompt': 0.001,
                'completion': 0.002
            },
            'gpt-3.5-turbo-instruct': {
                'prompt': 0.0015,
                'completion': 0.002
            }
        }

        # Handle model aliases and versions
        base_model = model.split(':')[0] if ':' in model else model
        model_costs = costs.get(base_model)
        
        if not model_costs:
            for known_model in costs.keys():
                if known_model in model:
                    model_costs = costs[known_model]
                    break
        
        if not model_costs:
            self.logger.warning(f"Unknown OpenAI model {model}, defaulting to zero cost")
            return 0.0
        
        prompt_tokens = tokens.get('prompt_tokens', 0)
        completion_tokens = tokens.get('completion_tokens', 0)
        
        prompt_cost = (prompt_tokens * model_costs['prompt']) / 1000
        completion_cost = (completion_tokens * model_costs['completion']) / 1000
        
        total_cost = prompt_cost + completion_cost
        
        self.logger.debug(
            f"OpenAI cost calculation for {model}: "
            f"prompt_tokens={prompt_tokens} (${prompt_cost:.6f}), "
            f"completion_tokens={completion_tokens} (${completion_cost:.6f}), "
            f"total=${total_cost:.6f}"
        )
        
        return total_cost