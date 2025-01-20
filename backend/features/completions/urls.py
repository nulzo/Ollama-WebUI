from rest_framework.routers import DefaultRouter
from features.completions.views import ChatViewSet, MessageImageViewSet

router = DefaultRouter()

router.register(r'completions', ChatViewSet, basename='completions')
router.register(r'images', MessageImageViewSet, basename='images')
