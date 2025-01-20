from rest_framework.routers import DefaultRouter

from features.tags.views import TagViewSet

router = DefaultRouter()

router.register(r'tags', TagViewSet, basename='tags')
