from api.views_old import (
    AssistantViewSet,
    ConversationList,
    ConversationDetail,
    MessageList,
    SettingsList,
    SettingsDetail,
    MessageDetail,
    UserSettingsList,
    UserSettingsDetail,
    CurrentUserView,
    LoginView,
    LogoutView
)
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views.message_view import MessageViewSet
from api.view.ollama import OllamaModels
from api.views.authentication_view import LoginView as Login, LogoutView as Logout, RegisterView
from api.view.ollama import OllamaPrompts
from api.view.openai import OpenAIChat, OpenAIModels
from api.views.chat_view import ChatView

router = DefaultRouter()

router.register(r"assistant", AssistantViewSet)
router.register(r'messages', MessageViewSet, basename='message')


urlpatterns = [
    path("chat/", ChatView.as_view(), name="chat"),
    path("conversations/", ConversationList.as_view(), name="conversation-list"),
    path("conversations/<str:pk>/", ConversationDetail.as_view(), name="conversation-detail"),
    path("messages/", MessageList.as_view(), name="message-list"),
    path("messages/<int:pk>/", MessageDetail.as_view(), name="message-detail"),
    path("user/", UserSettingsList.as_view(), name="user-list"),
    path("user/<int:pk>/", UserSettingsDetail.as_view(), name="user-detail"),
    path("settings/", SettingsList.as_view(), name="settings-list"),
    path("settings/<int:pk>/", SettingsDetail.as_view(), name="settings-detail"),
    path("", include(router.urls)),
    path("models/ollama/", OllamaModels.as_view(), name="ollama_models"),
    path("ollama/default/", OllamaPrompts.as_view(), name="ollama_default_prompts"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path('auth/login/', Login.as_view(), name='auth_login'),
    path('auth/logout/', Logout.as_view(), name='auth_logout'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('user/current/', CurrentUserView.as_view(), name='current_user'),
    path("models/openai/", OpenAIModels.as_view(), name="openai_models"),
]
