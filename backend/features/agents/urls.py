from rest_framework.routers import DefaultRouter
from features.agents.views import AgentViewSet

router = DefaultRouter()

router.register(r"agents", AgentViewSet, basename="agents")
