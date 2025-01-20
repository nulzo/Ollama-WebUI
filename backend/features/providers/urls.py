from rest_framework.routers import DefaultRouter
from features.providers.views import ProviderSettingsViewSet, ModelsViewSet

router = DefaultRouter()

router.register(r'providers', ProviderSettingsViewSet, basename='providers')
router.register(r'models', ModelsViewSet, basename='models')
