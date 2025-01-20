from rest_framework.routers import DefaultRouter
from features.prompts.views import PromptViewSet, CustomPromptViewSet

router = DefaultRouter()

router.register(r"prompts", PromptViewSet, basename="prompts")
router.register(r"custom-prompts", CustomPromptViewSet, basename="custom-prompts")
