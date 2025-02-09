from features.analytics.models import EventLog
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Avg, Count, F, FloatField
from django.db.models.functions import TruncHour, TruncDay, Cast
from datetime import datetime
from typing import List, Dict, Any

class EventLogRepository:
    """
    Repository for EventLog interactions.
    """
    def __init__(self):
        self.model = EventLog

    def create_event_log(self, event_type: str, user, data: dict = None):
        """
        Create and save a new event log.

        """
        event_log = EventLog.objects.create(
            event_type=event_type,
            user=user,
            data=data or {}
        )
        return event_log

    def list_event_logs(self, **filters):
        """
        Retrieve a list of event logs based on filters.
        """
        return EventLog.objects.filter(**filters)

    def get_event_log(self, event_id):
        """
        Retrieve a specific event log.
        """
        return EventLog.objects.get(id=event_id)
    
    def get_analytics(self, user_id: int, timeframe: str = 'week'):
        """
        Get analytics data for a specific user.
        """
        return EventLog.objects.filter(user_id=user_id, created_at__gte=timezone.now() - timedelta(days=7))
    
    def get_analytics_by_event_type(self, user_id: int, event_type: str):
        """
        Get analytics data for a specific user by event type.
        """
        return EventLog.objects.filter(user_id=user_id, event_type=event_type)
    
    
    def get_events_by_timeframe(self, user_id: str, start_date: datetime, end_date: datetime) -> List[EventLog]:
        """Get base queryset for events within timeframe"""
        return self.model.objects.filter(
            user_id=user_id,
            timestamp__gte=start_date,
            timestamp__lte=end_date
        ).order_by('timestamp')

    def get_usage_overview(self, queryset) -> List[Dict[str, Any]]:
        """Get aggregated usage overview"""
        usage_data = []
        for event in queryset:
            usage_data.append({
                'date': event.timestamp.date().isoformat(),
                'tokens': event.data.get('tokens', 0),
                'cost': float(event.data.get('cost', 0)),
                'messages': 1  # Each event represents one message
            })
        return usage_data

    def get_cost_metrics(self, queryset) -> List[Dict[str, Any]]:
        """Get aggregated cost metrics"""
        cost_data = {}
        
        for event in queryset:
            date = event.timestamp.date().isoformat()
            if date not in cost_data:
                cost_data[date] = {
                    'date': date,
                    'total_cost': 0,
                    'total_tokens': 0,
                    'prompt_tokens': 0,
                    'completion_tokens': 0
                }
            
            data = event.data
            cost_data[date]['total_cost'] += float(data.get('cost', 0))
            cost_data[date]['total_tokens'] += int(data.get('tokens', 0))
            cost_data[date]['prompt_tokens'] += int(data.get('prompt_tokens', 0))
            cost_data[date]['completion_tokens'] += int(data.get('completion_tokens', 0))

        # Calculate derived metrics
        metrics = []
        for date_data in cost_data.values():
            if date_data['total_tokens'] > 0:
                metrics.append({
                    'date': date_data['date'],
                    'total_cost': float(date_data['total_cost']),
                    'total_tokens': float(date_data['total_tokens']),
                    'prompt_tokens': float(date_data['prompt_tokens']),
                    'completion_tokens': float(date_data['completion_tokens']),
                    'cost_per_token': float(date_data['total_cost'] / date_data['total_tokens']),
                    'efficiency': float(date_data['completion_tokens'] / date_data['total_tokens'] * 100),
                    'tokens_per_dollar': float(date_data['total_tokens'] / date_data['total_cost']) if date_data['total_cost'] > 0 else 0
                })
        
        return sorted(metrics, key=lambda x: x['date'])


    def get_token_efficiency(self, queryset) -> List[Dict[str, Any]]:
        """Get token efficiency metrics"""
        efficiency_data = {}
        
        for event in queryset:
            date = event.timestamp.date().isoformat()
            if date not in efficiency_data:
                efficiency_data[date] = {
                    'date': date,
                    'prompt_tokens': 0,
                    'completion_tokens': 0
                }
            
            data = event.data
            efficiency_data[date]['prompt_tokens'] += int(data.get('prompt_tokens', 0))
            efficiency_data[date]['completion_tokens'] += int(data.get('completion_tokens', 0))

        # Calculate efficiency metrics
        metrics = []
        for date_data in efficiency_data.values():
            if date_data['prompt_tokens'] > 0:
                total_tokens = date_data['prompt_tokens'] + date_data['completion_tokens']
                metrics.append({
                    'date': date_data['date'],
                    'ratio': float(date_data['completion_tokens'] / date_data['prompt_tokens']),
                    'efficiency': float(date_data['completion_tokens'] / total_tokens * 100)
                })
        
        return sorted(metrics, key=lambda x: x['date'])

    def get_model_usage(self, queryset) -> List[Dict[str, Any]]:
        """Get model usage statistics"""
        model_data = {}
        
        for event in queryset:
            model = event.data.get('model', 'unknown')
            if model not in model_data:
                model_data[model] = {
                    'model': model,
                    'count': 0,
                    'total_tokens': 0,
                    'total_cost': 0
                }
            
            data = event.data
            model_data[model]['count'] += 1
            model_data[model]['total_tokens'] += float(data.get('tokens', 0))
            model_data[model]['total_cost'] += float(data.get('cost', 0))

        return list(model_data.values())

    def get_time_analysis(self, queryset) -> List[Dict[str, Any]]:
        """Get time-based analysis"""
        time_data = {}
        
        for event in queryset:
            hour = event.timestamp.replace(minute=0, second=0).isoformat()
            if hour not in time_data:
                time_data[hour] = {
                    'interval': hour,
                    'message_count': 0,
                    'total_tokens': 0,
                    'total_response_time': 0
                }
            
            data = event.data
            metadata = data.get('metadata', {})
            time_data[hour]['message_count'] += 1
            time_data[hour]['total_tokens'] += int(data.get('tokens', 0))
            time_data[hour]['total_response_time'] += float(metadata.get('generation_time', 0))

        # Calculate averages
        analysis = []
        for hour_data in time_data.values():
            if hour_data['message_count'] > 0:
                analysis.append({
                    'interval': hour_data['interval'],
                    'message_count': hour_data['message_count'],
                    'avg_tokens': float(hour_data['total_tokens'] / hour_data['message_count']),
                    'avg_response_time': float(hour_data['total_response_time'] / hour_data['message_count'])
                })
        
        return sorted(analysis, key=lambda x: x['interval'])

    def get_raw_events(self, queryset):
        """Get raw events"""
        print("RAW EVENTS", queryset)
        return queryset

    def get_model_usage(self, queryset):
        """Get model usage statistics with proper type casting"""
        return queryset.values('data__model').annotate(
            count=Cast(Count('id'), FloatField()),
            total_tokens=Cast(Sum('data__tokens'), FloatField()),
            total_cost=Cast(Sum('data__cost'), FloatField())
        )