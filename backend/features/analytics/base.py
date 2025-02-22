from abc import ABC, abstractmethod

class BaseAnalyticsProvider(ABC):
    @abstractmethod
    def process_event(self, event_type: str, payload: dict):
        """Process an analytics event."""
        pass