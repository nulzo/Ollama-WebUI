import base64
import logging
from typing import AnyStr, Dict, List, Optional, Union
from timeit import default_timer as timer
import time
import json

from django.conf import settings
from openai import Client

from features.providers.clients.base_provider import BaseProvider
from features.analytics.services.analytics_service import AnalyticsEventService

logger = logging.getLogger(__name__)


class OpenRouterProvider(BaseProvider):
    def __init__(self, config: dict) -> None:
        print(f"Initializing OpenRouterProvider with config: {config}")
        if not isinstance(config, dict):
            raise ValueError(f"Expected config to be a dict, but got {type(config).__name__}")
        
        self.is_enabled = config.get("is_enabled", False)
        _api_key = config.get("api_key")
        
        if self.is_enabled and not _api_key:
            raise ValueError("API key is required for OpenRouter")
            
        self._client = Client(
            api_key=_api_key,
            base_url="https://openrouter.ai/api/v1"
        )
        
        self.config = config.copy()
        self._models_cache = None
        self._models_cache_time = 0
        self._models_cache_ttl = 300  # 5 minutes
        super().__init__(analytics_service=AnalyticsEventService())

    def update_config(self, config: Dict) -> None:
        self.is_enabled = config.get("is_enabled", self.is_enabled)
        _api_key = config.get("api_key")
        if _api_key:
            self._client.api_key = _api_key
            self.config["api_key"] = _api_key
        
        self.logger.info(f"Updated OpenRouterProvider config. Enabled: {self.is_enabled}")

    def chat(self, model: str, messages: Union[List, AnyStr], stream: bool = False, **kwargs):
        if stream:
            return self.stream(model, messages, **kwargs)
        else:
            return self.generate(model, messages, **kwargs)

    def stream(
        self,
        model: str,
        messages: Union[List, AnyStr],
        user_id: int = None,
        conversation_id: str = None,
        **kwargs
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
                model=model, messages=processed_messages, stream=True, **kwargs
            )

            for chunk in response:
                if not chunk.choices:
                    continue

                delta = chunk.choices[0].delta

                if hasattr(delta, "content") and delta.content is not None:
                    content = delta.content
                    buffer += content
                    yield json.dumps({"content": content, "status": "generating"})

            if buffer:
                # OpenRouter doesn't provide token usage in the stream in a standard way
                # We can try to get it from the last message if available or estimate.
                # For now, we will leave it as 0
                
                event_data = {
                    "user_id": user_id,
                    "event_type": "chat_completion",
                    "model": model,
                    "tokens": 0,
                    "prompt_tokens": 0,
                    "completion_tokens": 0,
                    "cost": self.calculate_cost({}, model),
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
                "tokens": 0,
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "cost": self.calculate_cost({}, model),
                "metadata": {
                    "conversation_id": conversation_id,
                    "generation_time": generation_time,
                    "error": str(e),
                },
            }
            self.log_chat_completion(error_event_data)
            logger.error(f"Error in OpenRouter streaming generation: {str(e)}")
            yield json.dumps({"error": str(e), "status": "error"})
            
    def generate(self, model: str, messages: Union[List, AnyStr], **kwargs):
        processed_messages = self._process_messages(messages)

        response = self._client.chat.completions.create(
            model=model, messages=processed_messages, stream=False, **kwargs
        )

        return response.choices[0].message.content

    def _process_messages(self, messages: Union[List, AnyStr]) -> List[Dict]:
        processed_messages = []
        for message in messages:
            if not message.get("content") and not message.get("images"):
                continue

            processed_message = {"role": message["role"], "content": []}

            if message.get("content"):
                if isinstance(message["content"], str):
                    processed_message["content"] = message["content"]
                else:
                    processed_message["content"] = [{"type": "text", "text": message["content"]}]

            if message.get("images"):
                if not isinstance(processed_message["content"], list):
                    processed_message["content"] = [
                        {"type": "text", "text": processed_message["content"]}
                    ]

                for image in message["images"]:
                    if isinstance(image, bytes):
                        image_data = base64.b64encode(image).decode("utf-8")
                    elif isinstance(image, str):
                        image_data = image # Assuming it's already base64

                    processed_message["content"].append(
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_data}"},
                        }
                    )
            
            processed_messages.append(processed_message)

        return processed_messages if processed_messages else None

    def models(self):
        if not self.is_enabled:
            self.logger.info("OpenRouter provider is not enabled; skipping model loading.")
            return []
            
        current_time = time.time()
        if self._models_cache is not None and current_time - self._models_cache_time < self._models_cache_ttl:
            self.logger.info("Using cached OpenRouter models")
            return self._models_cache
            
        try:
            # OpenRouter model list is available at /models
            response = self._client.models.list()
            model_list = response.data
            
            models = []
            for model in model_list:
                # Parse the actual provider from the model ID
                provider_name = self._extract_provider_from_model_id(model.id)
                
                # Extract architecture information
                architecture = getattr(model, 'architecture', {})
                input_modalities = architecture.get('input_modalities', ['text'])
                output_modalities = architecture.get('output_modalities', ['text'])
                
                # Check capabilities
                vision_enabled = (
                    'image' in input_modalities or 
                    'vision' in model.id.lower() or 
                    'gpt-4o' in model.id.lower() or 
                    'claude-3' in model.id.lower() or
                    '#multimodal' in getattr(model, 'description', '').lower()
                )
                
                # Check for tools support
                supported_parameters = getattr(model, 'supported_parameters', [])
                tools_enabled = 'tools' in supported_parameters or 'tool_choice' in supported_parameters
                
                # Get pricing information
                pricing = getattr(model, 'pricing', {})
                
                # Get top provider info for max tokens
                top_provider = getattr(model, 'top_provider', {})
                max_completion_tokens = top_provider.get('max_completion_tokens', 4096)
                
                models.append({
                    "id": f"{model.id}-openrouter", # Unique ID for our system
                    "name": getattr(model, 'name', model.id),
                    "model": model.id,
                    "description": getattr(model, 'description', ''),
                    "max_input_tokens": getattr(model, 'context_length', 4096),
                    "max_output_tokens": max_completion_tokens if max_completion_tokens else 4096,
                    "vision_enabled": vision_enabled,
                    "embedding_enabled": "embed" in model.id.lower(),
                    "tools_enabled": tools_enabled,
                    "provider": provider_name,  # Use the extracted provider name
                    "via_openrouter": True,  # Flag to indicate this model is accessed via OpenRouter
                    
                    # Additional rich metadata
                    "context_length": getattr(model, 'context_length', 4096),
                    "pricing": {
                        "prompt": float(pricing.get('prompt', '0')),
                        "completion": float(pricing.get('completion', '0')),
                        "image": float(pricing.get('image', '0')) if pricing.get('image') else None,
                    },
                    "architecture": {
                        "modality": architecture.get('modality', 'text->text'),
                        "input_modalities": input_modalities,
                        "output_modalities": output_modalities,
                        "tokenizer": architecture.get('tokenizer', 'Unknown'),
                    },
                    "supported_parameters": supported_parameters,
                    "is_moderated": top_provider.get('is_moderated', False),
                    "canonical_slug": getattr(model, 'canonical_slug', model.id),
                })
            
            self._models_cache = models
            self._models_cache_time = current_time
            
            return models
        except Exception as e:
            self.logger.error(f"Error fetching OpenRouter models: {str(e)}")
            return []

    def _extract_provider_from_model_id(self, model_id: str) -> str:
        """
        Extract the actual provider name from the OpenRouter model ID.
        Examples:
        - "openai/gpt-4" -> "openai"
        - "anthropic/claude-3" -> "anthropic"
        - "google/gemini-pro" -> "google"
        - "meta-llama/llama-2" -> "meta"
        - "mistralai/mistral-7b" -> "mistral"
        """
        if "/" in model_id:
            provider_part = model_id.split("/")[0].lower()
            
            # Map common provider prefixes to standard names
            provider_mapping = {
                "openai": "openai",
                "anthropic": "anthropic", 
                "google": "google",
                "meta-llama": "meta",
                "meta": "meta",
                "mistralai": "mistral",
                "mistral": "mistral",
                "cohere": "cohere",
                "ai21": "ai21",
                "huggingface": "huggingface",
                "together": "together",
                "perplexity": "perplexity",
                "databricks": "databricks",
                "nvidia": "nvidia",
                "microsoft": "microsoft",
                "qwen": "qwen",
                "deepseek": "deepseek",
                "01-ai": "01-ai",
                "liquid": "liquid",
                "reflection": "reflection",
                "gryphe": "gryphe",
                "neversleep": "neversleep",
                "cognitivecomputations": "cognitive",
                "nousresearch": "nous",
                "alpindale": "alpindale",
                "undi95": "undi95",
                "sophosympatheia": "sophosympatheia",
                "openchat": "openchat",
                "teknium": "teknium",
                "austism": "austism",
                "jondurbin": "jondurbin",
                "lynn": "lynn",
                "mattshumer": "mattshumer",
                "sao10k": "sao10k",
                "eva-unit-01": "eva-unit-01",
                "infermatic": "infermatic",
                "koboldai": "koboldai",
                "thebloke": "thebloke",
                "pygmalionai": "pygmalionai",
                "ehartford": "ehartford",
                "mancer": "mancer",
                "openrouter": "openrouter",
            }
            
            return provider_mapping.get(provider_part, provider_part)
        else:
            # If no "/" in model_id, return openrouter as fallback
            return "openrouter"

    def calculate_cost(self, tokens: Dict[str, int], model: str) -> float:
        # TODO: Implement actual cost calculation based on OpenRouter pricing
        return 0.0

    def supports_tools(self, model: str) -> bool:
        # Assume all models support tools for now, as OpenRouter is a gateway.
        # This can be refined later if needed.
        return True 