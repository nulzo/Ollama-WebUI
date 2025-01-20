from django.contrib import admin
from django.urls import include, path

from features.agents.urls import router as agents_router
from features.authentication.urls import router as auth_router
from features.completions.urls import router as completions_router
from features.conversations.urls import router as conversations_router
from features.knowledge.urls import router as knowledge_router
from features.prompts.urls import router as prompts_router
from features.providers.urls import router as providers_router
from features.tags.urls import router as tags_router
from features.tools.urls import router as tools_router

# Combine all router URLs
api_v1_patterns = [
    path('', include(agents_router.urls)),
    path('', include(auth_router.urls)),
    path('', include(completions_router.urls)),
    path('', include(conversations_router.urls)),
    path('', include(knowledge_router.urls)),
    path('', include(prompts_router.urls)),
    path('', include(providers_router.urls)),
    path('', include(tags_router.urls)),
    path('', include(tools_router.urls)),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1_patterns)),
]
