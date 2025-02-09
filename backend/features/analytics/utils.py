from functools import wraps
from analytics.services import AnalyticsEventService

# Create a singleton instance for convenience.
default_analytics_service = AnalyticsEventService()

def log_event_decorator(event_type: str, data_extractor=None):
    """
    Decorator to automatically log an analytics event for a view.
    
    Arguments:
      - event_type: The type/name of the event.
      - data_extractor: Optional function that accepts (request, response)
                        and returns a dict with additional data.
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(*args, **kwargs):
            request = args[0]
            response = view_func(*args, **kwargs)
            user = getattr(request, "user", None)
            data = data_extractor(request, response) if data_extractor else {}
            default_analytics_service.log_event(event_type, user, data)
            return response
        return _wrapped_view
    return decorator