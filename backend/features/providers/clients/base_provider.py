import logging
from abc import ABC, abstractmethod
from typing import AnyStr, Dict, List, Optional, Union, Generator
from timeit import default_timer as timer

from features.analytics.services.analytics_service import AnalyticsEventService
from features.authentication.models import CustomUser  # assuming this is your user model
from features.conversations.models import Conversation  # if you need conversation context

class BaseProvider(ABC):
    def __init__(self, analytics_service: Optional[AnalyticsEventService] = None) -> None:
        self._analytics_service = analytics_service
        self.logger = logging.getLogger(self.__class__.__name__)

    @abstractmethod
    def update_config(self, config: Dict) -> None:
        """
        Update provider-specific configuration.
        Example: update endpoint, API keys, organization ids, etc.
        """
        pass

    @abstractmethod
    def chat(
        self,
        model: str,
        messages: Union[List[Dict], AnyStr],
        stream: bool = False,
        **kwargs
    ) -> Union[str, Generator[str, None, None]]:
        """
        Send a chat request to the provider.
        If stream is False, return the full response as text.
        If stream is True, return a generator yielding response chunks.
        """
        pass

    @abstractmethod
    def stream(
        self,
        model: str,
        messages: Union[List[Dict], AnyStr],
        **kwargs
    ) -> Generator[str, None, None]:
        """
        Stream a response from the provider.
        Must yield chunks, for example as JSON strings.
        """
        pass

    @abstractmethod
    def generate(
        self,
        model: str,
        messages: Union[List[Dict], AnyStr],
        **kwargs
    ) -> str:
        """
        Generate a response from the provider without streaming.
        """
        pass

    @abstractmethod
    def models(self) -> List[str]:
        """
        Return a list of available models for this provider.
        """
        pass

    @abstractmethod
    def calculate_cost(self, tokens: Dict[str, int], model: str) -> float:
        """
        Calculate the cost of a request based on token usage.
        """
        pass

    @property
    def analytics_service(self) -> Optional[AnalyticsEventService]:
        return self._analytics_service

    @analytics_service.setter
    def analytics_service(self, service: Optional[AnalyticsEventService]) -> None:
        self._analytics_service = service

    def log_chat_completion(self, event_data: Dict) -> None:
        """
        Log a chat completion analytics event using the analytics service.
        Expects event_data to include:
          - event_type (e.g., "chat_completion")
          - user_id (primary key of the user responsible)
        """
        try:
            event_type = event_data.get("event_type")
            if not event_type:
                raise ValueError("Event type must be provided for analytics logging.")

            user_id = event_data.get("user_id")
            if not user_id:
                raise ValueError("User ID must be provided for analytics logging.")

            # Retrieve user instance (this code assumes your user model is CustomUser)
            user = CustomUser.objects.get(pk=user_id)
            if self.analytics_service:
                self.analytics_service.log_event(event_type=event_type, user=user, data=event_data)
        except Exception as e:
            self.logger.error(f"Error logging chat completion: {e}")