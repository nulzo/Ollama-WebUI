from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuthViewSet, UserViewSet

router = DefaultRouter()
router.register('auth', AuthViewSet, basename='auth')
router.register('users', UserViewSet, basename='users')

urlpatterns = path('', include(router.urls))
