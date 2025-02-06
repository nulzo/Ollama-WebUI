from abc import ABC, abstractmethod
from typing import AnyStr, List, Union, Dict, Optional

from features.analytics.services.analytics_service import AnalyticsService
import logging

from features.authentication.models import CustomUser
from features.conversations.models import Conversation
from timeit import default_timer as timer


class BaseProvider(ABC):
    def __init__(self, analytics_service: AnalyticsService = None) -> None:
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
            self.log_chat_completion(model, messages, stream)
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
    def analytics_service(self) -> Optional[AnalyticsService]:
        return self._analytics_service

    @analytics_service.setter
    def analytics_service(self, service: Optional[AnalyticsService]) -> None:
        self._analytics_service = service

    def log_chat_completion(
            self,
            model: str,
            token_usage: Dict[str, int],
            user_id: Optional[int],
            conversation_id: Optional[str],
            generation_time: float,
            error: Optional[str] = None,
            metadata: Optional[Dict] = None
    ) -> None:
        """Log chat completion analytics"""
        if not self.analytics_service:
            self.logger.warning("Analytics service not configured")
            return

        try:
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
                    "generation_time": generation_time,
                    "tokens_per_second": (
                        token_usage.get("completion_tokens", 0) / generation_time
                        if generation_time > 0 else 0
                    ),
                    **(metadata or {})
                }
            }

            if error:
                event_data["metadata"]["error"] = error
                event_data["event_type"] = "error"

            self.analytics_service.track_event(event_data)

        except Exception as e:
            self.logger.error(f"Error logging chat completion: {str(e)}")
