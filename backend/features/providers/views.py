from features.providers.services.models_service import ModelsService

from rest_framework.decorators import action

from features.providers.services.provider_settings_service import ProviderSettingsService

import logging

from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from features.authentication.models import Settings
from features.providers.serializers.provider_settings_serializer import ProviderSettingsSerializer
from features.authentication.serializers.settings import SettingsSerializer
from features.authentication.services.settings_service import ProviderSettingsService
from api.utils.exceptions import ServiceError, ValidationError
from api.utils.responses.response import api_response

from features.providers.services.models_service import ModelsService



logger = logging.getLogger(__name__)


class ModelsViewSet(viewsets.ViewSet):
    """
    ViewSet for handling model operations.

    list: Get all available models from all providers
    by_provider: Get models for a specific provider
    download: Download a model from Ollama
    """

    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.models_service = ModelsService()
        self.logger = logging.getLogger(__name__)

    def list(self, request, *args, **kwargs):
        """Get all available models from all providers"""
        try:
            models = self.models_service.get_provider_models(request.user.id)
            return api_response(data=models, links={"self": request.build_absolute_uri()})
        except ServiceError as e:
            self.logger.error(f"Service error fetching models: {str(e)}")
            return api_response(
                error={
                    "code": "SERVICE_ERROR",
                    "message": "Failed to fetch models",
                    "details": str(e),
                },
                status=503,
            )
        except Exception as e:
            self.logger.error(f"Error fetching models: {str(e)}")
            return api_response(
                error={
                    "code": "MODELS_FETCH_ERROR",
                    "message": "Failed to fetch models",
                    "details": str(e),
                },
                status=500,
            )

    @action(detail=False, methods=["get"], url_path="provider/(?P<provider_type>[^/.]+)")
    def by_provider(self, request, provider_type=None):
        """Get models for a specific provider"""
        try:
            models = self.models_service.get_provider_models(request.user.id, provider_type)
            return api_response(
                data=models.get(provider_type, []), links={"self": request.build_absolute_uri()}
            )
        except ServiceError as e:
            self.logger.error(f"Service error fetching models for {provider_type}: {str(e)}")
            return api_response(
                error={
                    "code": "SERVICE_ERROR",
                    "message": f"Failed to fetch models for {provider_type}",
                    "details": str(e),
                },
                status=503,
            )
        except Exception as e:
            self.logger.error(f"Error fetching models for {provider_type}: {str(e)}")
            return api_response(
                error={
                    "code": "MODELS_FETCH_ERROR",
                    "message": f"Failed to fetch models for {provider_type}",
                    "details": str(e),
                },
                status=500,
            )

    @action(detail=False, methods=["post"], url_path="download")
    def download_model(self, request):
        """Download a model from Ollama"""
        try:
            model_name = request.data.get("model")
            if not model_name:
                return api_response(
                    error={
                        "code": "INVALID_REQUEST",
                        "message": "Model name is required",
                    },
                    status=400,
                )
            
            # Start the download process
            download_task = self.models_service.download_model(
                model_name=model_name,
                user_id=request.user.id
            )
            
            return api_response(
                data={"task_id": str(download_task.id)},
                links={"self": request.build_absolute_uri()}
            )
        except ServiceError as e:
            self.logger.error(f"Service error downloading model {model_name}: {str(e)}")
            return api_response(
                error={
                    "code": "SERVICE_ERROR",
                    "message": f"Failed to download model {model_name}",
                    "details": str(e),
                },
                status=503,
            )
        except Exception as e:
            self.logger.error(f"Error downloading model {model_name}: {str(e)}")
            return api_response(
                error={
                    "code": "MODEL_DOWNLOAD_ERROR",
                    "message": f"Failed to download model {model_name}",
                    "details": str(e),
                },
                status=500,
            )
            
    @action(detail=False, methods=["get"], url_path="download/(?P<task_id>[^/]+)")
    def download_status(self, request, task_id=None):
        """Get the status of a model download task"""
        try:
            # Remove any trailing slash from task_id
            if task_id and task_id.endswith('/'):
                task_id = task_id[:-1]
                
            self.logger.info(f"Getting download status for task ID: {task_id}")
            status = self.models_service.get_download_status(task_id)
            return api_response(
                data=status,
                links={"self": request.build_absolute_uri()}
            )
        except ServiceError as e:
            self.logger.error(f"Service error getting download status for task {task_id}: {str(e)}")
            return api_response(
                error={
                    "code": "SERVICE_ERROR",
                    "message": f"Failed to get download status",
                    "details": str(e),
                },
                status=503,
            )
        except Exception as e:
            self.logger.error(f"Error getting download status for task {task_id}: {str(e)}")
            return api_response(
                error={
                    "code": "DOWNLOAD_STATUS_ERROR",
                    "message": f"Failed to get download status",
                    "details": str(e),
                },
                status=500,
            )
            
    @action(detail=False, methods=["get"], url_path="available")
    def available_models(self, request):
        """Get available models from Ollama library"""
        try:
            models = self.models_service.get_available_models()
            return api_response(
                data=models,
                links={"self": request.build_absolute_uri()}
            )
        except ServiceError as e:
            self.logger.error(f"Service error fetching available models: {str(e)}")
            return api_response(
                error={
                    "code": "SERVICE_ERROR",
                    "message": "Failed to fetch available models",
                    "details": str(e),
                },
                status=503,
            )
        except Exception as e:
            self.logger.error(f"Error fetching available models: {str(e)}")
            return api_response(
                error={
                    "code": "AVAILABLE_MODELS_ERROR",
                    "message": "Failed to fetch available models",
                    "details": str(e),
                },
                status=500,
            )
            
    @action(detail=False, methods=["delete"], url_path="(?P<provider_type>[^/.]+)/(?P<model_name>[^/.]+)")
    def delete_model(self, request, provider_type=None, model_name=None):
        """Delete a model from a provider"""
        try:
            if not provider_type or not model_name:
                return api_response(
                    error={
                        "code": "INVALID_REQUEST",
                        "message": "Provider type and model name are required",
                    },
                    status=400,
                )
            
            # Delete the model
            result = self.models_service.delete_model(
                provider_type=provider_type,
                model_name=model_name,
                user_id=request.user.id
            )
            
            return api_response(
                data=result,
                links={"self": request.build_absolute_uri()}
            )
        except ServiceError as e:
            self.logger.error(f"Service error deleting model {model_name}: {str(e)}")
            return api_response(
                error={
                    "code": "SERVICE_ERROR",
                    "message": f"Failed to delete model {model_name}",
                    "details": str(e),
                },
                status=503,
            )
        except Exception as e:
            self.logger.error(f"Error deleting model {model_name}: {str(e)}")
            return api_response(
                error={
                    "code": "MODEL_DELETE_ERROR",
                    "message": f"Failed to delete model {model_name}",
                    "details": str(e),
                },
                status=500,
            )


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
