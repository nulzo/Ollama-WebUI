from api.views import (
    AssistantViewSet,
    ConversationList,
    ConversationDetail,
    MessageList,
    SettingsList,
    SettingsDetail,
    MessageDetail,
    UserSettingsList,
    UserSettingsDetail,
)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.view.message import MessageView
from api.view.ollama import OllamaModels
from rest_framework.authtoken.views import obtain_auth_token
from .views import LoginView, LogoutView

router = DefaultRouter()

router.register(r"assistant", AssistantViewSet)


urlpatterns = [
    path("conversations/", ConversationList.as_view(), name="conversation-list"),
    path("conversations/<str:pk>/", ConversationDetail.as_view(), name="conversation-detail"),
    path("messages/", MessageList.as_view(), name="message-list"),
    path("messages/<int:pk>/", MessageDetail.as_view(), name="message-detail"),
    path("user/", UserSettingsList.as_view(), name="user-list"),
    path("user/<int:pk>/", UserSettingsDetail.as_view(), name="user-detail"),
    path("settings/", SettingsList.as_view(), name="settings-list"),
    path("settings/<int:pk>/", SettingsDetail.as_view(), name="settings-detail"),
    path("", include(router.urls)),
    path("chat/ollama/", MessageView.as_view(), name="chat"),
    path("models/ollama/", OllamaModels.as_view(), name="ollama_models"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
