import logging

class AnalyticsDispatcher:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.providers = []

    def register_provider(self, provider):
        self.providers.append(provider)

    def emit(self, event_type: str, payload: dict):
        self.logger.debug(f"Emitting event '{event_type}' with payload: {payload}")
        for provider in self.providers:
            try:
                provider.process_event(event_type, payload)
            except Exception as e:
                self.logger.error(f"Provider {provider} failed to process event: {e}")

dispatcher = AnalyticsDispatcher()
