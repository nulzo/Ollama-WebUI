from features.analytics.serializers.analytics_serializer import AnalyticsAggregateSerializer
from features.analytics.repositories.analytics_repository import EventLogRepository
from django.db.models.functions import TruncHour, TruncDay
from datetime import datetime, timedelta

class AnalyticsEventService:
    """
    Service for logging analytics events.
    """

    def __init__(self, repository=None):
        # Allow dependency injection of a custom repository if needed.
        self.repository = repository or EventLogRepository()

    def log_event(self, event_type: str, user, data: dict = None):
        """
        Log an event by delegating to the repository.
        """
        return self.repository.create_event_log(event_type=event_type, user=user, data=data)
    
    def get_analytics(self, user_id: str, timeframe: str = 'week'):
        """Get aggregated analytics data for the specified timeframe"""
        end_date = datetime.now()
        start_date = self._get_start_date(end_date, timeframe)
        
        # Get base queryset from repository
        base_qs = self.repository.get_events_by_timeframe(user_id, start_date, end_date)
        
        # Calculate totals and averages
        total_tokens = 0
        total_cost = 0
        total_messages = 0
        total_generation_time = 0
        
        # Initialize data structures for the response
        token_usage = []
        usage_overview = []
        model_usage = []
        time_analysis = []
        message_stats = []
        raw_events = []
        
        # Process each event to match the frontend structure
        for event in base_qs:
            if event.event_type == 'chat_completion':
                data = event.data
                tokens = data.get('tokens', 0)
                cost = float(data.get('cost', 0))
                generation_time = data.get('metadata', {}).get('generation_time', 0)
                
                # Update totals
                total_tokens += tokens
                total_cost += cost
                total_messages += 1
                total_generation_time += generation_time
                
                timestamp = event.timestamp.isoformat()
                
                # Build raw_events array
                raw_events.append({
                    'timestamp': timestamp,
                    'model': data.get('model', ''),
                    'cost': cost,
                    'tokens': tokens,
                    'prompt_tokens': data.get('prompt_tokens', 0),
                    'completion_tokens': data.get('completion_tokens', 0),
                    'metadata': data.get('metadata', {})
                })
                
                # Add to message_stats
                message_stats.append({
                    'timestamp': timestamp,
                    'sent': 1,
                    'received': 1
                })
                
                # Add to token_usage
                token_usage.append({
                    'timestamp': timestamp,
                    'count': tokens,
                    'model': data.get('model', '')
                })
                
                # Add to usage_overview
                usage_overview.append({
                    'timestamp': timestamp,
                    'tokens': tokens,
                    'cost': cost,
                    'messages': 1
                })
        
        # Calculate model usage
        model_usage_dict = {}
        for event in base_qs:
            if event.event_type == 'chat_completion':
                data = event.data
                model = data.get('model', '')
                if model not in model_usage_dict:
                    model_usage_dict[model] = {'tokens': 0, 'cost': 0}
                model_usage_dict[model]['tokens'] += data.get('tokens', 0)
                model_usage_dict[model]['cost'] += float(data.get('cost', 0))
        
        model_usage = [
            {'model': model, 'tokens': data['tokens'], 'cost': data['cost']}
            for model, data in model_usage_dict.items()
        ]
        
        # Calculate time analysis
        hour_analysis = {}
        for event in base_qs:
            if event.event_type == 'chat_completion':
                hour = event.timestamp.hour
                data = event.data
                if hour not in hour_analysis:
                    hour_analysis[hour] = {'requests': 0, 'tokens': 0, 'cost': 0}
                hour_analysis[hour]['requests'] += 1
                hour_analysis[hour]['tokens'] += data.get('tokens', 0)
                hour_analysis[hour]['cost'] += float(data.get('cost', 0))
        
        time_analysis = [
            {
                'hour': hour,
                'requests': data['requests'],
                'tokens': data['tokens'],
                'cost': data['cost']
            }
            for hour, data in hour_analysis.items()
        ]
        
        # Calculate average response time
        average_response_time = (
            total_generation_time / total_messages if total_messages > 0 else 0
        )
        
        return {
            'totalTokens': total_tokens,
            'totalCost': total_cost,
            'totalMessages': total_messages,
            'averageResponseTime': average_response_time,
            'tokenUsage': token_usage,
            'usageOverview': usage_overview,
            'modelUsage': model_usage,
            'timeAnalysis': time_analysis,
            'messageStats': message_stats,
            'rawEvents': raw_events
        }
    def _serialize_queryset(self, queryset):
        """Convert queryset to list and ensure all values are JSON serializable"""
        def serialize_value(value):
            if isinstance(value, datetime):
                return value.isoformat()
            if isinstance(value, (int, float)):
                return float(value)  # Convert all numbers to float for consistency
            return value

        # Convert queryset items to dictionaries if they aren't already
        data = []
        for item in queryset:
            if hasattr(item, '__dict__'):
                # For model instances, convert to dict and exclude non-serializable fields
                item_dict = {
                    'id': item.id,
                    'timestamp': item.timestamp,
                    'event_type': item.event_type,
                    'data': item.data
                }
            else:
                # For already dictionaries (like annotated querysets)
                item_dict = item

            # Serialize the values
            serialized_item = {
                key: serialize_value(value) 
                for key, value in item_dict.items()
            }
            data.append(serialized_item)
        print(f"queryset: {queryset}, data: {data}")
        return data


    def _get_start_date(self, end_date: datetime, timeframe: str) -> datetime:
        timeframe_map = {
            'day': timedelta(days=1),
            'week': timedelta(weeks=1),
            'month': timedelta(days=30),
            'year': timedelta(days=365)
        }
        return end_date - timeframe_map.get(timeframe, timeframe_map['week'])

    def _sanitize_events(self, queryset):
        """Remove sensitive data from events"""
        return queryset.values(
            'timestamp',
            'data__model',
            'data__tokens',
            'data__prompt_tokens',
            'data__completion_tokens',
            'data__cost',
            'data__metadata__generation_time',
            'data__metadata__tokens_per_second'
        ).order_by('timestamp')