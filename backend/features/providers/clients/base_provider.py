import logging
from abc import ABC, abstractmethod
from typing import AnyStr, Dict, List, Optional, Union, Generator, Any, TypeVar, Generic, cast
from timeit import default_timer as timer

from pydantic import ValidationError

from features.analytics.services.analytics_service import AnalyticsEventService
from features.authentication.models import CustomUser
from features.conversations.models import Conversation
from features.providers.schemas import Message, TokenUsage, ProviderConfig, AnalyticsEvent

# Define a type variable for provider-specific configurations
T = TypeVar('T', bound=ProviderConfig)

class BaseProvider(ABC, Generic[T]):
    """
    Abstract base class for all providers.
    Generic type T allows for provider-specific configuration types.
    """
    def __init__(self, 
                 config: Optional[Dict[str, Any]] = None, 
                 analytics_service: Optional[AnalyticsEventService] = None) -> None:
        self._analytics_service = analytics_service
        self.logger = logging.getLogger(self.__class__.__name__)
        self.config: T = self._validate_config(config or {})
    
    def _validate_config(self, config: Dict[str, Any]) -> T:
        """
        Validate and convert the configuration dictionary to a Pydantic model.
        Subclasses should override this method to use their specific config model.
        """
        try:
            # This is a placeholder - subclasses should override with their specific config type
            return cast(T, ProviderConfig(**config))
        except ValidationError as e:
            self.logger.error(f"Configuration validation error: {e}")
            raise ValueError(f"Invalid configuration: {e}")

    @abstractmethod
    def update_config(self, config: Dict[str, Any]) -> None:
        """
        Update provider-specific configuration.
        Example: update endpoint, API keys, organization ids, etc.
        """
        pass

    @abstractmethod
    def chat(
        self,
        model: str,
        messages: Union[List[Dict[str, Any]], List[Message], AnyStr],
        stream: bool = False,
        **kwargs: Any
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
        messages: Union[List[Dict[str, Any]], List[Message], AnyStr],
        **kwargs: Any
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
        messages: Union[List[Dict[str, Any]], List[Message], AnyStr],
        **kwargs: Any
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
    def calculate_cost(self, tokens: TokenUsage, model: str) -> float:
        """
        Calculate the cost of a request based on token usage.
        """
        pass

    @abstractmethod
    def supports_tools(self, model: str) -> bool:
        """
        Check if the specified model supports function calling/tools.
        
        Args:
            model: The model name to check
            
        Returns:
            bool: True if the model supports function calling, False otherwise
        """
        pass

    @property
    def analytics_service(self) -> Optional[AnalyticsEventService]:
        return self._analytics_service

    @analytics_service.setter
    def analytics_service(self, service: Optional[AnalyticsEventService]) -> None:
        self._analytics_service = service

    def log_chat_completion(self, event_data: Dict[str, Any]) -> None:
        """
        Log a chat completion analytics event using the analytics service.
        Expects event_data to include:
          - event_type (e.g., "chat_completion")
          - user_id (primary key of the user responsible)
        """
        try:
            # Validate the event data using Pydantic
            event = AnalyticsEvent(**event_data)
            
            if not self.analytics_service:
                self.logger.warning("Analytics service not available, skipping event logging")
                return
                
            # Retrieve user instance
            user = CustomUser.objects.get(pk=event.user_id)
            self.analytics_service.log_event(
                event_type=event.event_type, 
                user=user, 
                data=event_data
            )
        except ValidationError as e:
            self.logger.error(f"Invalid analytics event data: {e}")
        except CustomUser.DoesNotExist:
            self.logger.error(f"User with ID {event_data.get('user_id')} not found")
        except Exception as e:
            self.logger.error(f"Error logging chat completion: {e}")