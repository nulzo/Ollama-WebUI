import json
import logging
import base64
from dataclasses import dataclass
from timeit import default_timer as timer
from typing import AnyStr, Dict, List, Optional, Union, Generator

from django.conf import settings
from ollama import Client as OllamaClient  # assuming this is the official Ollama client

from features.analytics.services.analytics_service import AnalyticsEventService
from features.providers.clients.base_provider import BaseProvider
from api.utils.exceptions.exceptions import ServiceError
from features.tools.models import Tool  # if you use tools for function calling

logger = logging.getLogger(__name__)


def normalize_endpoint(endpoint: str) -> str:
    """
    Ensures the endpoint has a proper URL scheme.
    """
    if not endpoint.startswith(("http://", "https://")):
        return f"http://{endpoint}"
    return endpoint

class OllamaProvider(BaseProvider):
    def __init__(self, config: dict) -> None:
        print(f"Initializing OllamaProvider with config: {config}")
        if not isinstance(config, dict):
            raise ValueError("Expected config to be a dict.")
        endpoint = config.get("endpoint")
        if not endpoint:
            raise ValueError("Endpoint is required in the config for OllamaProvider.")
        # Normalize the endpoint directly.
        endpoint = normalize_endpoint(endpoint)
        # Pull in is_enabled; default to False if not specified.
        self.is_enabled = config.get("is_enabled", False)
        # Create and store our configuration directly as a dictionary.
        self.config = {
            "endpoint": endpoint,
            "is_enabled": self.is_enabled,
            "api_key": config.get("api_key"),
            "organization_id": config.get("organization_id"),
        }
        self._client = OllamaClient(host=endpoint)
        self._cancel_event = None
        self.logger = logger
        super().__init__(analytics_service=AnalyticsEventService())

    def update_config(self, config: Dict) -> None:
        """
        Update the Ollama provider configuration.

        For example, if the endpoint or is_enabled flag has changed.
        """
        # Update endpoint if provided and changed.
        if "endpoint" in config:
            new_endpoint = normalize_endpoint(config["endpoint"])
            if new_endpoint != self.config["endpoint"]:
                self.config["endpoint"] = new_endpoint
                self._client = OllamaClient(host=new_endpoint)
                self.logger.info(
                    f"Updated Ollama client with new endpoint: {new_endpoint}"
                )
        # Update the is_enabled flag if provided.
        if "is_enabled" in config and config["is_enabled"] != self.is_enabled:
            self.is_enabled = config["is_enabled"]
            self.config["is_enabled"] = config["is_enabled"]

    def chat(
        self,
        model: str,
        messages: Union[List[Dict], AnyStr],
        stream: bool = False,
        **kwargs
    ) -> Union[str, Generator[str, None, None]]:
        """
        Send a chat request to Ollama.
        If stream is True, this returns a generator that streams responses.
        Otherwise, it returns the complete response as a string.
        """
        try:
            if stream:
                return self.stream(model, messages, **kwargs)
            else:
                return self.generate(model, messages, **kwargs)
        except Exception as e:
            self.logger.error(f"Error in Ollama chat: {str(e)}")
            raise ServiceError(f"Ollama chat failed: {str(e)}")

    def _flatten_messages(self, messages: Union[List[Dict], AnyStr]) -> List[Dict]:
        """
        Flatten the messages into a list of dictionaries.
        """
        if isinstance(messages, str):
            return [{"role": "user", "content": messages}]
        return messages
    
    def stream(
        self,
        model: str,
        messages: Union[List[Dict], AnyStr],
        **kwargs
    ) -> Generator[str, None, None]:
        """
        Stream a response from the Ollama service.
        Yields JSON strings with a "content" key populated from the response.
        """
        # For simplicity, use a simple flag for cancellation.
        self._cancel_event = False  
        start_time = timer()
        token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}

        processed_messages = self._flatten_messages(messages)

        try:
            # Call the Ollama client in streaming mode.
            response_stream = self._client.chat(model=model, messages=processed_messages, stream=True)

            for chunk in response_stream:
                # Optionally log the raw chunk for debugging
                self.logger.debug(f"Ollama raw chunk: {chunk}")

                if chunk.get("done"):
                    # Update token usage from the final chunk.
                    token_usage["prompt_tokens"] = chunk.get("prompt_eval_count", 0)
                    token_usage["completion_tokens"] = chunk.get("eval_count", 0)
                    
                    event_data = self._prepare_analytics_event(token_usage, model, start_time, kwargs.get("user_id"))
                    self.log_chat_completion(event_data)
                    
                    yield json.dumps({"status": "done", "usage": token_usage})
                else:
                    # Try extracting the actual text.
                    text = ""
                    if "message" in chunk:
                        # If the chunk wraps the text under a "message" key
                        text = chunk.get("message", {}).get("content", "")
                    else:
                        # Fall back to "content" if available
                        text = chunk.get("content", "")
                        
                    if not text.strip():
                        continue  # Skip empty strings
                    
                    yield json.dumps({"content": text, "status": "generating"})
        except Exception as e:
            generation_time = timer() - start_time
            self.logger.error(f"Error in streaming generation: {str(e)}")
            event_data = self._prepare_analytics_event(
                token_usage, model, start_time, kwargs.get("user_id"), error=str(e)
            )
            self.log_chat_completion(event_data)
            yield json.dumps({"error": str(e), "status": "error"})

    def generate(
        self,
        model: str,
        messages: Union[List[Dict], AnyStr],
        **kwargs
    ) -> str:
        """
        Generate a non-streaming response from Ollama.
        """
        processed_messages = self._flatten_messages(messages)

        response = self._client.chat(model=model, messages=processed_messages, stream=False)
        # Assume the response is a dict with a "message" key.
        if isinstance(response, dict) and "message" in response:
            return response["message"]["content"]
        return str(response)

    def models(self) -> List[str]:
        """
        Return a list of available models from Ollama if the configuration is enabled.
        """
        if not self.is_enabled:
            self.logger.info("Ollama provider is not enabled; skipping model loading.")
            return []
        try:
            model_list = self._client.list()  # assumes the client supports a list() method
            return model_list
        except Exception as e:
            self.logger.error(f"Error fetching models: {str(e)}")
            return []

    def calculate_cost(self, tokens: Dict[str, int], model: str) -> float:
        """
        Calculate the cost for a request.
        For Ollama (running locally) cost is 0.
        """
        return 0.0
    
    
    def _prepare_analytics_event(
        self,
        token_usage: Dict[str, int],
        model: str,
        start_time: float,
        user_id: any,
        error: str = None
    ) -> Dict:
        """
        Build the analytics event data.
        Updates total token count, calculates generation time,
        and adds error information if provided.
        """
        # Calculate total tokens and generation time.
        token_usage["total_tokens"] = token_usage["prompt_tokens"] + token_usage["completion_tokens"]
        generation_time = timer() - start_time

        event_type = "error" if error else "chat_completion"
        event_data = {
            "user_id": user_id,
            "event_type": event_type,
            "model": model,
            "tokens": token_usage["total_tokens"],
            "prompt_tokens": token_usage["prompt_tokens"],
            "completion_tokens": token_usage["completion_tokens"],
            "cost": self.calculate_cost(token_usage, model),
            "metadata": {"generation_time": generation_time},
        }
        if error:
            event_data["metadata"]["error"] = error
        return event_data