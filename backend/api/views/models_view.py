import logging

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from api.services.models_service import ModelsService
from api.utils.exceptions import ServiceError
from api.utils.responses.response import api_response

logger = logging.getLogger(__name__)


class ModelsViewSet(viewsets.ViewSet):
    """
    ViewSet for handling model operations.

    list: Get all available models from all providers
    by_provider: Get models for a specific provider
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
