from api.views import ConversationList, ConversationDetail, MessageList, SettingsList, SettingsDetail, MessageDetail, UserSettingsList, UserSettingsDetail
from django.urls import path

urlpatterns = [
    path('conversations/', ConversationList.as_view(), name='conversation-list'),
    path('conversations/<str:pk>/', ConversationDetail.as_view(), name='conversation-detail'),
    path('messages/', MessageList.as_view(), name='message-list'),
    path('messages/<int:pk>/', MessageDetail.as_view(), name='message-detail'),
    path('user/', UserSettingsList.as_view(), name='user-list'),
    path('user/<int:pk>/', UserSettingsDetail.as_view(), name='user-detail'),
    path('settings/', SettingsList.as_view(), name='settings-list'),
    path('settings/<int:pk>/', SettingsDetail.as_view(), name='settings-detail'),
]
