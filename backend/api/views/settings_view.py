import logging

from django.db import IntegrityError
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated

from api.models.providers.provider import ProviderSettings
from api.models.settings.settings import Settings
from api.providers.provider_factory import provider_factory
from api.serializers.provider_settings_serializer import \
    ProviderSettingsSerializer
from api.serializers.settings import SettingsSerializer
from api.services.settings_service import ProviderSettingsService
from api.utils.exceptions import ServiceError, ValidationError
from api.utils.responses.response import api_response

logger = logging.getLogger(__name__)


class ProviderSettingsViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for handling provider settings operations.

    list: Get all provider settings for the authenticated user
    create: Create new provider settings
    retrieve: Get specific provider settings
    update: Update provider settings
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ProviderSettingsSerializer
    lookup_field = "id"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.provider_settings_service = ProviderSettingsService()

    def get_queryset(self):
        """Filter provider settings for the authenticated user"""
        return self.provider_settings_service.get_user_settings_queryset(self.request.user)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return api_response(data=serializer.data, links={"self": request.build_absolute_uri()})
        except Exception as e:
            logger.error(f"Error fetching provider settings: {str(e)}")
            return api_response(
                error={
                    "code": "PROVIDER_SETTINGS_FETCH_ERROR",
                    "message": "Failed to fetch provider settings",
                    "details": str(e),
                },
                status=500,
            )

    def create(self, request, *args, **kwargs):
        try:
            settings = self.provider_settings_service.create_settings(
                user=request.user, data=request.data
            )
            return api_response(data=settings, links={"self": request.build_absolute_uri()})
        except ValidationError as e:
            logger.warning(f"Validation error: {str(e)}")
            return api_response(
                error={
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid provider settings data",
                    "details": str(e),
                },
                status=400,
            )
        except ServiceError as e:
            logger.error(f"Service error: {str(e)}")
            return api_response(
                error={
                    "code": "SERVICE_ERROR",
                    "message": "Provider settings service error",
                    "details": str(e),
                },
                status=503,
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return api_response(
                error={
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred",
                    "details": str(e),
                },
                status=500,
            )

    def update(self, request, *args, **kwargs):
        try:
            settings = self.provider_settings_service.update_settings(
                user=request.user, provider_id=kwargs.get("id"), data=request.data
            )
            return api_response(data=settings, links={"self": request.build_absolute_uri()})
        except ValidationError as e:
            return api_response(
                error={
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid provider settings data",
                    "details": str(e),
                },
                status=400,
            )
        except ServiceError as e:
            return api_response(
                error={
                    "code": "SERVICE_ERROR",
                    "message": "Provider settings service error",
                    "details": str(e),
                },
                status=503,
            )
        except Exception as e:
            logger.error(f"Error updating provider settings: {str(e)}")
            return api_response(
                error={
                    "code": "UPDATE_ERROR",
                    "message": "Failed to update provider settings",
                    "details": str(e),
                },
                status=500,
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return api_response(
                data=serializer.data,
                links={
                    "self": request.build_absolute_uri(),
                    "update": f"/api/provider-settings/{instance.id}/",
                },
            )
        except Exception as e:
            logger.error(f"Error fetching provider settings: {str(e)}")
            return api_response(
                error={
                    "code": "PROVIDER_SETTINGS_FETCH_ERROR",
                    "message": "Failed to fetch provider settings",
                    "details": str(e),
                },
                status=500,
            )


class SettingsViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SettingsSerializer

    def get_queryset(self):
        return Settings.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
