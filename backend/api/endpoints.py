from api.views_old import (
    AssistantViewSet,
    ConversationList,
    ConversationDetail,
    UserSettingsList,
    UserSettingsDetail,
    CurrentUserView,
    LoginView,
    LogoutView
)
from django.urls import path, include
from api.views.agent_view import AgentViewSet
from rest_framework.routers import DefaultRouter
from api.views.message_view import MessageViewSet
from api.view.ollama import OllamaModels
from api.views.authentication_view import LoginView as Login, LogoutView as Logout, RegisterView
from api.view.ollama import OllamaPrompts
from api.view.openai import OpenAIChat, OpenAIModels
from api.views.chat_view import ChatView
from api.views.image_view import MessageImageViewSet
from api.views.settings_view import ProviderSettingsViewSet, SettingsViewSet

router = DefaultRouter()

router.register(r"assistant", AssistantViewSet)
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'images', MessageImageViewSet, basename='images')
router.register(r'settings', SettingsViewSet, basename='settings')
router.register(r'providers', ProviderSettingsViewSet, basename='provider')
router.register(r'agents', AgentViewSet, basename='agent')


urlpatterns = [
    path("chat/", ChatView.as_view(), name="chat"),
    path("conversations/", ConversationList.as_view(), name="conversation-list"),
    path("conversations/<str:pk>/", ConversationDetail.as_view(), name="conversation-detail"),
    path("user/", UserSettingsList.as_view(), name="user-list"),
    path("user/<int:pk>/", UserSettingsDetail.as_view(), name="user-detail"),
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
    path('ollama/default/<str:style>/', OllamaPrompts.as_view(), name="ollama_default_prompts_styled"),
]
