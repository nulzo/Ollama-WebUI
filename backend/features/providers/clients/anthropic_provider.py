import logging
from typing import Dict, List, Union, AsyncGenerator

from anthropic import Anthropic, AsyncAnthropic

from features.analytics.services.analytics_service import AnalyticsEventService
from features.providers.clients.base_provider import BaseProvider
from api.utils.exceptions.exceptions import ServiceError

logger = logging.getLogger(__name__)


class AnthropicProvider(BaseProvider):
    def __init__(self, config: dict) -> None:
        print(f"Initializing AnthropicProvider with config: {config}")
        if not isinstance(config, dict):
            raise ValueError("Expected config to be a dict.")

        # Retrieve is_enabled flag and API key from configuration.
        self.is_enabled = config.get("is_enabled", False)
        api_key = config.get("api_key")
        if self.is_enabled and not api_key:
            raise ValueError("API key is required for AnthropicProvider when enabled.")

        # Save a copy of the configuration.
        self.config = config.copy()

        try:
            # Instantiate both synchronous and asynchronous Anthropic clients.
            self._client = Anthropic(api_key=api_key)
            self._client_aio = AsyncAnthropic(api_key=api_key)
        except Exception as e:
            raise ServiceError(f"Failed to initialize Anthropic client: {e}")

        self.logger = logger
        super().__init__(analytics_service=AnalyticsEventService())

    def _process_messages(self, messages: Union[List, str]) -> List[Dict]:
        """
        Ensure messages are in the expected format—a list of dictionaries
        with 'role' and 'content'. If a raw string is provided, assume it's a user message.
        """
        if isinstance(messages, str):
            return [{"role": "user", "content": messages}]
        elif isinstance(messages, list):
            processed = []
            for msg in messages:
                if isinstance(msg, dict) and "role" in msg and "content" in msg:
                    processed.append(msg)
                elif isinstance(msg, str):
                    processed.append({"role": "user", "content": msg})
                else:
                    # If the message is not well-formed, convert it to a string.
                    processed.append({"role": "user", "content": str(msg)})
            return processed
        else:
            raise ValueError("Messages must be a list or a string.")

    def chat(self, model: str, messages: Union[List, str], max_tokens: int = 1024) -> str:
        """
        Synchronous method that generates a response from Anthropic.
        """
        if not self.is_enabled:
            raise ValueError("Anthropic Provider is not enabled.")

        processed_messages = self._process_messages(messages)

        try:
            response = self._client.messages.create(
                model=model,
                max_tokens=max_tokens,
                messages=processed_messages,
                stream=False
            )
            return response.content
        except Exception as e:
            self.logger.error(f"Error generating content with Anthropic: {e}")
            raise ServiceError(f"Failed to generate content: {e}")

    async def chat_stream(
        self, model: str, messages: Union[List, str], max_tokens: int = 1024
    ) -> AsyncGenerator[str, None]:
        """
        Asynchronous streaming method that generates a response from Anthropic.
        This method uses the async client and yields parts of the response as they are received.
        """
        if not self.is_enabled:
            raise ValueError("Anthropic Provider is not enabled.")

        processed_messages = self._process_messages(messages)

        try:
            # Request a streaming response by setting stream=True.
            stream = await self._client_aio.messages.create(
                model=model,
                max_tokens=max_tokens,
                messages=processed_messages,
                stream=True
            )
            # Iterate over streaming events and yield their content.
            async for event in stream:
                yield event.content
        except Exception as e:
            self.logger.error(f"Error streaming content with Anthropic: {e}")
            raise ServiceError(f"Streaming generation failed: {e}")

    def models(self) -> List[str]:
        """
        Return a static list of available Anthropic models.
        """
        if not self.is_enabled:
            self.logger.info("Anthropic provider is not enabled; skipping model retrieval.")
            return []
        # Adjust or extend this list depending on the supported models.
        return ["claude-2", "claude-2.0-100k", "claude-3-5-sonnet-latest"]

    def update_config(self, config: Dict) -> None:
        """
        Update the provider's configuration.
        """
        new_api_key = config.get("api_key", self.config.get("api_key"))
        if new_api_key != self.config.get("api_key"):
            self.config["api_key"] = new_api_key
            try:
                self._client = Anthropic(api_key=new_api_key)
                self._client_aio = AsyncAnthropic(api_key=new_api_key)
                self.logger.info("Updated Anthropic client's API key.")
            except Exception as e:
                self.logger.error(f"Error updating API key for Anthropic: {e}")
                raise ServiceError(f"Failed to update API key: {e}")

        if "is_enabled" in config:
            self.is_enabled = config["is_enabled"]
            
    def calculate_cost(self, prompt: str, response: str) -> float:
        return 0.0

    def generate(self, model: str, messages: Union[List, str], max_tokens: int = 1024) -> str:
        return self.chat(model, messages, max_tokens)

    def stream(self, model: str, messages: Union[List, str], max_tokens: int = 1024) -> AsyncGenerator[str, None]:
        return self.chat_stream(model, messages, max_tokens)