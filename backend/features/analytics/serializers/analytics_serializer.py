from rest_framework import serializers
from features.analytics.models import EventLog
from features.authentication.serializers.user_serializer import UserSerializer

class AnalyticsEventSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    # Expose additional analytics data stored in the `data` JSONField.
    model = serializers.SerializerMethodField()
    tokens = serializers.SerializerMethodField()
    prompt_tokens = serializers.SerializerMethodField()
    completion_tokens = serializers.SerializerMethodField()
    cost = serializers.SerializerMethodField()
    metadata = serializers.SerializerMethodField()

    class Meta:
        model = EventLog
        fields = [
            "id",
            "user",
            "event_type",
            "model",
            "tokens",
            "prompt_tokens",
            "completion_tokens",
            "cost",
            "metadata",
            "timestamp",
        ]
        read_only_fields = ["id", "timestamp"]

    def get_model(self, obj):
        return obj.data.get("model") if obj.data else None

    def get_tokens(self, obj):
        return obj.data.get("tokens") if obj.data else None

    def get_prompt_tokens(self, obj):
        return obj.data.get("prompt_tokens") if obj.data else None

    def get_completion_tokens(self, obj):
        return obj.data.get("completion_tokens") if obj.data else None

    def get_cost(self, obj):
        return obj.data.get("cost") if obj.data else None

    def get_metadata(self, obj):
        return obj.data.get("metadata", {}) if obj.data else {}
    

class AnalyticsAggregateSerializer(serializers.Serializer):
    """Serializer for aggregated analytics data"""
    class MetricSerializer(serializers.Serializer):
        def to_representation(self, instance):
            # Ensure all numeric values are floats
            data = {
                key: float(value) if isinstance(value, (int, float)) else value
                for key, value in instance.items()
            }
            print(data)
            return data

    usageOverview = serializers.ListField(child=MetricSerializer())
    messageStats = serializers.ListField(child=MetricSerializer())
    modelUsage = serializers.ListField(child=MetricSerializer())
    costMetrics = serializers.ListField(child=MetricSerializer())
    tokenEfficiency = serializers.ListField(child=MetricSerializer())
    timeAnalysis = serializers.ListField(child=MetricSerializer())
    rawEvents = serializers.ListField(child=MetricSerializer())