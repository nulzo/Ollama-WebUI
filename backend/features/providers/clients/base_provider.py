from abc import ABC, abstractmethod
from typing import AnyStr, List, Union, Dict, Optional

from features.analytics.services.analytics_service import AnalyticsEventService
import logging


from features.authentication.models import CustomUser
from features.conversations.models import Conversation
from timeit import default_timer as timer


class BaseProvider(ABC):
    def __init__(self, analytics_service: AnalyticsEventService = None) -> None:
        self._analytics_service = analytics_service
        self.logger = logging.getLogger(__name__)


    def chat(
            self,
            model: str,
            user: CustomUser,
            conversation: Conversation,
            messages: Union[List, AnyStr],
            stream: bool = False
    ) -> None:
        """Forced implementation for chat entry (regardless of stream)"""
        try:
            # Initialize a timer
            start = timer()
            if stream:
                self.stream(model, messages)
            else:
                self.generate(model, messages)
            generation_time = timer() - start
            # self.log_chat_completion(model, messages, stream)
        except Exception as e:
            self.logger.error(e)

    @abstractmethod
    def stream(self, model: str, messages: Union[List, AnyStr]):
        """Stream a response"""
        ...

    @abstractmethod
    def generate(self, model: str, messages: Union[List, AnyStr]):
        """Generate a response without streaming"""
        ...

    @abstractmethod
    def model(self):
        ...

    @abstractmethod
    def models(self):
        ...

    @abstractmethod
    def calculate_cost(self): ...

    @property
    def analytics_service(self) -> Optional[AnalyticsEventService]:
        return self._analytics_service


    @analytics_service.setter
    def analytics_service(self, service: Optional[AnalyticsEventService]) -> None:
        self._analytics_service = service

    def log_chat_completion(self, event_data: Dict) -> None:
        """
        Logs a chat completion analytics event.
        The event_data is expected to include at least:
        - "event_type": a string indicating the type of event (e.g. "chat_completion")
        - "user_id": the primary key of the user that generated the event
        """
        try:
            # Ensure an event type is provided.
            event_type = event_data.get("event_type")
            if not event_type:
                raise ValueError("Event type is required for analytics logging.")

            # Ensure that user_id is available to fetch the user instance.
            user_id = event_data.get("user_id")
            if not user_id:
                raise ValueError("User ID is required for logging analytics events.")

            # Retrieve the user instance from the database.
            user = CustomUser.objects.get(pk=user_id)

            # Log the event with a valid user instance.
            self.analytics_service.log_event(
                event_type=event_type,
                user=user,
                data=event_data
            )
        except Exception as e:
            self.logger.error(f"Error logging chat completion: {str(e)}")
