from rest_framework.routers import DefaultRouter

from features.tools.views import ToolViewSet

router = DefaultRouter()

router.register(r'tools', ToolViewSet, basename='tools')
