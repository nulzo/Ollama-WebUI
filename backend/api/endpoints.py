from api.views_old import (
    AssistantViewSet,
    UserSettingsList,
    UserSettingsDetail,
    CurrentUserView,
    LoginView,
    LogoutView
)
from django.urls import path, include
from api.views.agent_view import AgentViewSet
from api.views.prompt_view import PromptView
from rest_framework.routers import DefaultRouter
from api.views.message_view import MessageViewSet
from api.views.authentication_view import LoginView as Login, LogoutView as Logout, RegisterView
from api.views.chat_view import ChatView
from api.views.image_view import MessageImageViewSet
from api.views.settings_view import ProviderSettingsViewSet, SettingsViewSet
from api.views.conversation_view import ConversationViewSet
from api.views.tools_view import ToolViewSet
from api.views.models_view import ModelsViewSet


router = DefaultRouter()

router.register(r"assistant", AssistantViewSet)
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'images', MessageImageViewSet, basename='images')
router.register(r'settings', SettingsViewSet, basename='settings')
router.register(r'providers', ProviderSettingsViewSet, basename='provider')
router.register(r'agents', AgentViewSet, basename='agent')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'tools', ToolViewSet, basename='tool')
router.register(r'models', ModelsViewSet, basename='models')


urlpatterns = [
    path("chat/", ChatView.as_view(), name="chat"),
    path("user/", UserSettingsList.as_view(), name="user-list"),
    path("user/<int:pk>/", UserSettingsDetail.as_view(), name="user-detail"),
    path("", include(router.urls)),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path('auth/login/', Login.as_view(), name='auth_login'),
    path('auth/logout/', Logout.as_view(), name='auth_logout'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('user/current/', CurrentUserView.as_view(), name='current_user'),
    path("prompts/", PromptView.as_view(), name="prompts"),
    path("prompts/<str:style>/", PromptView.as_view(), name="styled_prompts"),
]
