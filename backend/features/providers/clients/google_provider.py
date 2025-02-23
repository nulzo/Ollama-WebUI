import asyncio
import json
import logging
from typing import Dict, Generator, List, Union, AsyncGenerator

from google import genai  # from the google-genai package
# Optionally, you can import types if needed
# from google.genai import types

from features.analytics.services.analytics_service import AnalyticsEventService
from features.providers.clients.base_provider import BaseProvider
from api.utils.exceptions.exceptions import ServiceError

logger = logging.getLogger(__name__)

class GoogleProvider(BaseProvider):
    def __init__(self, config: dict) -> None:
        print(f"Initializing GoogleAiProvider with config: {config}")
        if not isinstance(config, dict):
            raise ValueError("Expected config to be a dict.")
        
        # Retrieve is_enabled flag; if enabled, ensure an API key is provided.
        self.is_enabled = config.get("is_enabled", False)
        api_key = config.get("api_key")
        if self.is_enabled and not api_key:
            raise ValueError("API key is required for GoogleAiProvider when enabled.")
        
        # Store configuration for later use.
        self.config = config.copy()
        
        try:
            # Initialize the Gemini API client using the google-genai SDK.
            # Here we use the synchronous client; for streaming we'll use self._client.aio below.
            self._client = genai.Client(api_key=api_key, http_options={'api_version': 'v1alpha'})
            logger.info("Google AI client initialized successfully.")
            print("Google AI client initialized successfully.", self._client.models.list()[0])
        except Exception as e:
            raise ServiceError(f"Failed to initialize Google AI client: {e}")
        
        self.logger = logger
        super().__init__(analytics_service=AnalyticsEventService())
    
    def models(self) -> List[str]:
        """
        Return a list of available Google AI (Gemini) models.
        Since Gemini API does not provide a dynamic model listing endpoint,
        a static list is returned.
        """
        if not self.is_enabled:
            logger.info("Google AI provider is not enabled; skipping model retrieval.")
            return []
        try:
            models = list(self._client.models.list())
            # Extract the model name if available; otherwise, use the string
            # representation of the model.
            model_names = [{"id": getattr(model, "name", str(model)), "name": getattr(model, "display_name=", str(model))} for model in models]
            return model_names
        except Exception as e:
            logger.error(f"Error retrieving models: {e}")
            raise ServiceError(f"Failed to retrieve models: {e}")
    
    def chat(self, model: str, messages: Union[List[str], str]) -> str:
        """
        Generate a response using the Google Gen AI (Gemini) API.
        If messages is a list, they are joined into a single prompt.
        """
        if not self.is_enabled:
            raise ValueError("Google AI Provider is not enabled.")
        
        prompt = "\n".join(messages) if isinstance(messages, list) else messages
        
        try:
            response = self._client.models.generate_content(
                model=model,
                contents=prompt
            )
            return response.text
        except Exception as e:
            logger.error(f"Error generating content with Google AI: {e}")
            raise ServiceError(f"Failed to generate content: {e}")
    
    def update_config(self, config: Dict) -> None:
        """
        Update the provider's configuration.
        Supports updating the API key and the is_enabled flag.
        """
        new_api_key = config.get("api_key", self.config.get("api_key"))
        if new_api_key != self.config.get("api_key"):
            self.config["api_key"] = new_api_key
            try:
                self._client = genai.Client(api_key=new_api_key, http_options={'api_version': 'v1alpha'})
                logger.info("Updated Google AI client's API key.")
            except Exception as e:
                logger.error(f"Error updating API key: {e}")
                raise ServiceError(f"Failed to update API key: {e}")
        
        if "is_enabled" in config:
            self.is_enabled = config["is_enabled"]

    def calculate_cost():
        return 0.0
    
    def generate(self, model: str, prompt: str) -> str:
        return self.chat(model, prompt)
    
    def chat_stream(
        self, model: str, messages: Union[List[Union[str, Dict]], str]
    ) -> Generator[str, None, None]:
        """
        Generate a streaming text response using the synchronous client.
        This method uses the synchronous streaming method (generate_content_stream)
        from the Google Gen AI SDK and yields JSON-formatted chunks.
        """
        if not self.is_enabled:
            raise ValueError("Google AI Provider is not enabled.")

        # Build the prompt based on the messages input
        if isinstance(messages, list):
            if messages and isinstance(messages[0], dict):
                prompt = "\n".join(msg.get("content", "") for msg in messages)
            else:
                prompt = "\n".join(messages)
        else:
            prompt = messages

        try:
            # Use the synchronous streaming method per the SDK docs.
            stream_iter = self._client.models.generate_content_stream(
                model=model,
                contents=prompt
            )
            for resp in stream_iter:
                # Skip empty responses
                if not resp.text or resp.text.strip() == "":
                    continue
                # Wrap the text in a JSON object so that json.loads(chunk) works downstream.
                chunk_data = {
                    "content": resp.text,
                    "status": "generating"
                }
                yield json.dumps(chunk_data)
        except Exception as e:
            logger.error(f"Error streaming content with Google AI: {e}")
            raise ServiceError(f"Streaming generation failed: {e}")

    def stream(
        self,
        model: str,
        messages: Union[List[Union[str, Dict]], str],
        **kwargs
    ) -> Generator[str, None, None]:
        """
        Synchronous wrapper that simply calls chat_stream.
        Extra kwargs (e.g. user_id, conversation_id) are ignored.
        """
        return self.chat_stream(model, messages)