from rest_framework.routers import DefaultRouter
from features.completions.views import ChatViewSet

router = DefaultRouter()

router.register(r'completions', ChatViewSet, basename='completions')
