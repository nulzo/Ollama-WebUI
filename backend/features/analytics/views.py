from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from features.analytics.services.analytics_service import AnalyticsService
from features.analytics.serializers.analytics_serializer import AnalyticsDataSerializer, AnalyticsEventSerializer
from api.utils.responses.response import api_response

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AnalyticsEventSerializer

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = AnalyticsService()

    def list(self, request):
        """Get analytics data for the authenticated user"""
        try:
            timeframe = request.query_params.get('timeframe', 'week')
            data = self.service.get_analytics(request.user.id, timeframe)
            serializer = AnalyticsDataSerializer(data)
            return api_response(data=serializer.data)
        except Exception as e:
            return api_response(error={"code": "FETCH_ERROR", "message": str(e)}, status=500)

    def create(self, request):
        """Create a new analytics event"""
        try:
            serializer = AnalyticsEventSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            event = self.service.track_event({
                **serializer.validated_data,
                'user_id': request.user.id
            })
            return api_response(data=AnalyticsEventSerializer(event).data)
        except Exception as e:
            return api_response(error={"code": "CREATE_ERROR", "message": str(e)}, status=500)