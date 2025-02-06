from typing import Any, Dict

from features.analytics.models import AnalyticsEvent
from features.analytics.repositories.analytics_repository import AnalyticsRepository

class AnalyticsService:
    def __init__(self):
        self.repository = AnalyticsRepository()

    def track_event(self, data: Dict[str, Any]) -> AnalyticsEvent:
        """Track an analytics event"""
        return self.repository.create_event(data)

    def get_analytics(self, user_id: int, timeframe: str = 'week') -> Dict:
        """Get analytics data for a user"""
        return self.repository.get_analytics(user_id, timeframe)