from rest_framework.routers import DefaultRouter
from features.knowledge.views import KnowledgeViewSet

router = DefaultRouter()

router.register(r'knowledge', KnowledgeViewSet, basename='knowledge')
