from django.contrib import admin
from django.urls import include, path

import features.conversations.urls as conversations
import api.endpoints

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api.endpoints)),
    path("api/v1/", include(conversations)),
]
