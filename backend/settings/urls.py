from django.contrib import admin
from django.urls import include, path

import features.conversations.urls as conversations
import api.endpoints
import features.completions.views as completions

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/v1/chat/completion/', completions.ChatView.as_view(), name='chat-completion'),
    path("api/v1/", include(api.endpoints)),
    path("api/v1/", include(conversations)),
]
