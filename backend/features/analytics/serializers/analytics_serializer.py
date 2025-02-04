from rest_framework import serializers
from features.analytics.models import AnalyticsEvent
from features.authentication.serializers.user_serializer import UserSerializer

class TokenUsageSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    timestamp = serializers.DateTimeField()
    promptTokens = serializers.IntegerField()
    completionTokens = serializers.IntegerField()
    model = serializers.CharField()
    cost = serializers.FloatField()

class MessageStatsSerializer(serializers.Serializer):
    timestamp = serializers.DateTimeField()
    sent = serializers.IntegerField()
    received = serializers.IntegerField()

class ModelUsageSerializer(serializers.Serializer):
    model = serializers.CharField()
    tokens = serializers.IntegerField()
    cost = serializers.DecimalField(max_digits=10, decimal_places=6)
    requests = serializers.IntegerField()
    errorRate = serializers.FloatField()

class TimeAnalysisSerializer(serializers.Serializer):
    hour = serializers.IntegerField()
    day = serializers.IntegerField()
    requests = serializers.IntegerField()
    tokens = serializers.IntegerField()
    cost = serializers.FloatField()

class AnalyticsDataSerializer(serializers.Serializer):
    tokenUsage = TokenUsageSerializer(many=True)
    messageStats = MessageStatsSerializer(many=True)
    modelUsage = ModelUsageSerializer(many=True)
    timeAnalysis = TimeAnalysisSerializer(many=True)
    totalTokens = serializers.IntegerField()
    totalCost = serializers.DecimalField(max_digits=10, decimal_places=6)
    totalMessages = serializers.IntegerField()
    averageResponseTime = serializers.FloatField()

class AnalyticsEventSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = AnalyticsEvent
        fields = [
            "id",
            "user",
            "event_type",
            "model",
            "tokens",
            "cost",
            "metadata",
            "timestamp",
            "created_at",
            "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "timestamp"]