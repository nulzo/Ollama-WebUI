from rest_framework.routers import DefaultRouter
from features.analytics.views import AnalyticsViewSet

router = DefaultRouter()

router.register(r"analytics", AnalyticsViewSet, basename="analytics")