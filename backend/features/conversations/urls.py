from django.urls import include, path
from rest_framework.routers import DefaultRouter

from features.conversations.views import ConversationViewSet, MessageViewSet

router = DefaultRouter()

router.register(r"conversations", ConversationViewSet, basename="conversation")
router.register(r"messages", MessageViewSet, basename="message")

urlpatterns = [
    path("", include(router.urls)),
]
