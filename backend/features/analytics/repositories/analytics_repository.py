from typing import List, Dict
from django.db.models import Sum, Avg, Count, Q
from django.utils import timezone
from datetime import timedelta
import logging
from decimal import Decimal
from django.db.models.functions import ExtractHour, ExtractDay


from features.analytics.models import AnalyticsEvent
from api.utils.interfaces.base_repository import BaseRepository

class AnalyticsRepository(BaseRepository[AnalyticsEvent]):
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def create_event(self, data: Dict) -> AnalyticsEvent:
        """Create a new analytics event"""
        try:
            self.logger.debug(f"Creating analytics event with data: {data}")
            event = AnalyticsEvent.objects.create(**data)
            self.logger.debug(f"Successfully created analytics event: {event.id}")
            return event
        except Exception as e:
            self.logger.error(f"Error creating analytics event: {str(e)}")
            raise

    def _get_token_usage(self, events) -> List[Dict]:
        self.logger.debug("Fetching token usage statistics")
        try:
            token_usage = list(events.filter(event_type='token_usage')
                .values('timestamp', 'model')
                .annotate(count=Sum('tokens'))
                .order_by('timestamp'))
            self.logger.debug(f"Token usage data: {token_usage}")
            return [{
                'timestamp': item['timestamp'].isoformat(),
                'promptTokens': int(item.get('prompt_tokens') or 0),
                'completionTokens': int(item.get('completion_tokens') or 0),
                'model': item.get('model'),
                'cost': str(item.get('cost') or 0),
                'count': int(item.get('count') or 0)
            } for item in token_usage]
        except Exception as e:
            self.logger.error(f"Error in _get_token_usage: {str(e)}")
            raise

    def _get_message_stats(self, events) -> List[Dict]:
        self.logger.debug("Fetching message statistics")
        try:
            message_stats = list(events.filter(event_type='message')
                .values('timestamp')
                .annotate(
                    sent=Count('id', filter=Q(metadata__direction='sent')),
                    received=Count('id', filter=Q(metadata__direction='received'))
                )
                .order_by('timestamp'))
            self.logger.debug(f"Message stats data: {message_stats}")
            return [{
                'timestamp': item['timestamp'].isoformat(),
                'sent': int(item.get('sent') or 0),
                'received': int(item.get('received') or 0)
            } for item in message_stats]
        except Exception as e:
            self.logger.error(f"Error in _get_message_stats: {str(e)}")
            raise

    def _get_model_usage(self, events) -> List[Dict]:
        self.logger.debug("Fetching model usage statistics")
        try:
            model_usage = list(events.filter(event_type='token_usage')
                .values('model')
                .annotate(
                    tokens=Sum('tokens'),
                    cost=Sum('cost')
                ))
            self.logger.debug(f"Model usage data: {model_usage}")
            return [{
                'model': item['model'],
                'tokens': int(item['tokens']) if item.get('tokens') else 0,
                'cost': str(item['cost']) if item.get('cost') else '0',
                'requests': int(item['requests']) if item.get('requests') else 0,
                'errorRate': float(item['errors'] / item['requests']) if (item.get('requests') and item.get('errors')) else 0
            } for item in model_usage]
        except Exception as e:
            self.logger.error(f"Error in _get_model_usage: {str(e)}")
            raise

    def _get_time_analysis(self, events) -> List[Dict]:
        self.logger.debug("Fetching time analysis statistics")
        try:
            time_analysis = list(events
            .annotate(
                hour=ExtractHour('timestamp'),
                day=ExtractDay('timestamp')
            )
            .values('hour', 'day')
            .annotate(
                requests=Count('id'),
                tokens=Sum('tokens'),
                cost=Sum('cost')
            )
            .order_by('day', 'hour'))
            self.logger.debug(f"Time analysis data: {time_analysis}")
            return [{
                'hour': item['hour'],
                'day': item['day'],
                'requests': int(item['requests']) if item.get('requests') else 0,
                'tokens': int(item['tokens']) if item.get('tokens') else 0,
                'cost': str(item['cost']) if item.get('cost') else '0'
            } for item in time_analysis]
        except Exception as e:
            self.logger.error(f"Error in _get_time_analysis: {str(e)}")
            raise

    def get_analytics(self, user_id: int, timeframe: str) -> Dict:
        self.logger.info(f"Getting analytics for user {user_id} with timeframe {timeframe}")
        try:
            now = timezone.now()
            if timeframe == 'day':
                start_date = now - timedelta(days=1)
            elif timeframe == 'week':
                start_date = now - timedelta(weeks=1)
            elif timeframe == 'month':
                start_date = now - timedelta(days=30)
            else:  # year
                start_date = now - timedelta(days=365)

            self.logger.debug(f"Querying events from {start_date} to {now}")
            events = AnalyticsEvent.objects.filter(
                user_id=user_id,
                timestamp__gte=start_date
            )

            # Get message events with response time
            message_events = events.filter(
                event_type='message',
                metadata__has_key='response_time'
            )
            
            # Calculate average response time manually to avoid JSON parsing issues
            response_times = [
                float(event.metadata.get('response_time', 0))
                for event in message_events
                if isinstance(event.metadata.get('response_time'), (int, float, str))
            ]
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0.0

            self.logger.debug(f"Response times: {response_times}")
            self.logger.debug(f"Average response time: {avg_response_time}")

            total_tokens = events.aggregate(total=Sum('tokens'))['total'] or 0
            total_cost = events.filter(event_type='token_usage').aggregate(
                total=Sum('cost'))['total'] or Decimal('0')
            total_messages = events.filter(event_type='message').count()

            self.logger.debug(f"Aggregated values - Tokens: {total_tokens}, Cost: {total_cost}, "
                            f"Messages: {total_messages}, Avg Response Time: {avg_response_time}")

            token_usage = self._get_token_usage(events)
            message_stats = self._get_message_stats(events)
            model_usage = self._get_model_usage(events)
            time_analysis = self._get_time_analysis(events)
            result = {
                'tokenUsage': token_usage,
                'messageStats': message_stats,
                'modelUsage': model_usage,
                'timeAnalysis': time_analysis,
                'totalTokens': int(total_tokens),
                'totalCost': str(total_cost),
                'totalMessages': total_messages,
                'averageResponseTime': float(avg_response_time)
            }
            
            self.logger.debug(f"Final analytics result: {result}")
            return result

        except Exception as e:
            self.logger.error(f"Error getting analytics: {str(e)}", exc_info=True)
            raise

        except Exception as e:
            self.logger.error(f"Error getting analytics: {str(e)}", exc_info=True)
            raise