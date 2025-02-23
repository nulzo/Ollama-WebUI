import base64
import logging
from typing import AnyStr, Dict, List, Optional, Union
from timeit import default_timer as timer

from django.conf import settings
from openai import Client
import json

from features.providers.clients.base_provider import BaseProvider
from features.analytics.services.analytics_service import AnalyticsEventService

logger = logging.getLogger(__name__)


class OpenAiProvider(BaseProvider):
    def __init__(self, config: dict) -> None:
        print(f"Initializing OpenAiProvider with config: {config}")
        if not isinstance(config, dict):
            raise ValueError(f"Expected config to be a dict, but got {type(config).__name__}")
        # Store is_enabled flag from config (defaulting to False)
        self.is_enabled = config.get("is_enabled", False)
        _api_key = config.get("api_key")
        # Only require an API key if provider is enabled
        if self.is_enabled and not _api_key:
            raise ValueError("API key is required")
        self._client = Client(api_key=_api_key)
        # Optionally store the complete configuration for future reference.
        self.config = config.copy()
        super().__init__(analytics_service=AnalyticsEventService())

    def chat(self, model: str, messages: Union[List, AnyStr]):
        """
        Sends a message to the OpenAI service without streaming.
        """
        processed_messages = self._process_messages(messages)

        response = self._client.chat.completions.create(
            model=model, messages=processed_messages, stream=False
        )

        return response.choices[0].message.content

    def stream(
        self,
        model: str,
        messages: Union[List, AnyStr],
        user_id: int = None,
        conversation_id: str = None,
    ):
        start_time = timer()
        token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        buffer = ""
        try:
            processed_messages = self._process_messages(messages)
            logger.debug(f"Model: {model}")
            logger.debug(f"Processed messages: {processed_messages}")

            if not processed_messages:
                raise ValueError("Messages array cannot be empty")

            response = self._client.chat.completions.create(
                model=model, messages=processed_messages, stream=True
            )

            # The response is an iterator that yields chunks
            for chunk in response:
                if not chunk.choices:
                    continue

                delta = chunk.choices[0].delta

                # Check if there's content in this delta
                if hasattr(delta, "content") and delta.content is not None:
                    content = delta.content
                    buffer += content  # Accumulate in buffer
                    token_usage["completion_tokens"] += 1
                    token_usage["total_tokens"] += 1
                    yield json.dumps(
                        {"content": content, "status": "generating"}  # Only yield the new chunk
                    )

            # Final yield with complete buffer and usage stats
            if buffer:
                logger.debug(f"Final response buffer: {buffer}")

                event_data = {
                    "user_id": user_id,
                    "event_type": "chat_completion",
                    "model": model,
                    "tokens": token_usage.get("total_tokens", 0),
                    "prompt_tokens": token_usage.get("prompt_tokens", 0),
                    "completion_tokens": token_usage.get("completion_tokens", 0),
                    "cost": self.calculate_cost(token_usage, model),
                    "metadata": {
                        "conversation_id": conversation_id,
                        "generation_time": timer() - start_time,
                    },
                }
                self.log_chat_completion(event_data)

                yield json.dumps({"status": "done", "usage": token_usage})

        except Exception as e:
            generation_time = timer() - start_time
            error_event_data = {
                "user_id": user_id,
                "event_type": "error",
                "model": model,
                "tokens": token_usage.get("total_tokens", 0),
                "prompt_tokens": token_usage.get("prompt_tokens", 0),
                "completion_tokens": token_usage.get("completion_tokens", 0),
                "cost": self.calculate_cost(token_usage, model),
                "metadata": {
                    "conversation_id": conversation_id,
                    "generation_time": generation_time,
                    "error": str(e),
                },
            }
            self.log_chat_completion(error_event_data)
            logger.error(f"Error in streaming generation: {str(e)}")
            yield json.dumps({"error": str(e), "status": "error"})

    def _process_messages(self, messages: Union[List, AnyStr]) -> List[Dict]:
        """
        Process messages into OpenAI's expected format.
        """
        print(f"Processing messages: {messages}")  # Add this line

        processed_messages = []
        for message in messages:
            # Skip empty messages
            if not message.get("content") and not message.get("images"):
                continue

            processed_message = {"role": message["role"], "content": []}

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
                    processed_message["content"] = [
                        {"type": "text", "text": processed_message["content"]}
                    ]

                for image in message["images"]:
                    if isinstance(image, bytes):
                        image_data = base64.b64encode(image).decode("utf-8")
                    elif isinstance(image, str):
                        if "\\x" in image:
                            image_bytes = (
                                bytes(image, "utf-8").decode("unicode_escape").encode("latin1")
                            )
                            image_data = base64.b64encode(image_bytes).decode("utf-8")
                        else:
                            image_data = image

                    processed_message["content"].append(
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_data}"},
                        }
                    )

            processed_messages.append(processed_message)

        print(f"Processed messages: {processed_messages}")  # Add this line
        return processed_messages if processed_messages else None  # Change this line

    def models(self):
        return self._client.models.list()

    def model(self): ...

    def models(self):
        """
        Return a list of available models from Ollama if the configuration is enabled.
        Each model returned is a dict containing:
        - id: model identifier
        - name: model name
        - model: display name of the model
        - max_input_tokens: maximum allowed input tokens (default: 2048)
        - max_output_tokens: maximum allowed output tokens (default: 2048)
        - vision_enabled: whether the model supports vision (default: False)
        - embedding_enabled: whether the model supports embeddings (default: False)
        - tools_enabled: whether the model supports tools (default: False)
        - provider: "openai"
        """
        if not self.is_enabled:
            self.logger.info("OpenAI provider is not enabled; skipping model loading.")
            return []
        try:
            model_list = self._client.models.list()
            return [
                {
                    "id": f"{model.id}-openai",
                    "name": model.id,
                    "model": model.id,
                    "max_input_tokens": 2048,
                    "max_output_tokens": 2048,
                    "vision_enabled": False,
                    "embedding_enabled": False,
                    "tools_enabled": False,
                    "provider": "openai",
                }
                for model in model_list
            ]
        except Exception as e:
            self.logger.error(f"Error fetching models: {str(e)}")
            return []

    def generate(self): ...

    def calculate_cost(self, tokens: Dict[str, int], model: str) -> float:
        """
        Calculate cost based on OpenAI's pricing
        https://openai.com/api/pricing/
        """
        costs = {
            # GPT-4 Turbo
            "gpt-4-0125-preview": {
                "prompt": 0.01,  # $0.01 per 1K prompt tokens
                "completion": 0.03,  # $0.03 per 1K completion tokens
            },
            # GPT-4 Vision
            "gpt-4-vision-preview": {"prompt": 0.01, "completion": 0.03},
            # GPT-4
            "gpt-4": {"prompt": 0.03, "completion": 0.06},
            "gpt-4-32k": {"prompt": 0.06, "completion": 0.12},
            # GPT-3.5 Turbo
            "gpt-3.5-turbo-0125": {"prompt": 0.0005, "completion": 0.0015},
            "gpt-3.5-turbo": {"prompt": 0.0005, "completion": 0.0015},
            "gpt-3.5-turbo-16k": {"prompt": 0.001, "completion": 0.002},
            "gpt-3.5-turbo-instruct": {"prompt": 0.0015, "completion": 0.002},
        }

        # Handle model aliases and versions
        base_model = model.split(":")[0] if ":" in model else model
        model_costs = costs.get(base_model)

        if not model_costs:
            for known_model in costs.keys():
                if known_model in model:
                    model_costs = costs[known_model]
                    break

        if not model_costs:
            self.logger.warning(f"Unknown OpenAI model {model}, defaulting to zero cost")
            return 0.0

        prompt_tokens = tokens.get("prompt_tokens", 0)
        completion_tokens = tokens.get("completion_tokens", 0)

        prompt_cost = (prompt_tokens * model_costs["prompt"]) / 1000
        completion_cost = (completion_tokens * model_costs["completion"]) / 1000

        total_cost = prompt_cost + completion_cost

        self.logger.debug(
            f"OpenAI cost calculation for {model}: "
            f"prompt_tokens={prompt_tokens} (${prompt_cost:.6f}), "
            f"completion_tokens={completion_tokens} (${completion_cost:.6f}), "
            f"total=${total_cost:.6f}"
        )

        return total_cost

    def update_config(self, config: Dict) -> None:
        """
        Update the OpenAiProvider's configuration.
        """
        # You can merge the new config with the existing one.
        self.config.update(config)
        # If the API key has been updated, reinitialize the client.
        if "api_key" in config:
            self._client = Client(api_key=config["api_key"])
        logger.info("OpenAiProvider configuration updated.")
