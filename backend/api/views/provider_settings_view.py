from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.services.provider_settings_service import ProviderSettingsService
from api.utils.exceptions import ValidationError, ServiceError, NotFoundException
from api.utils.responses.response import api_response


class ProviderSettingsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ProviderSettingsService()

    def list(self, request):
        """Get all provider settings for the authenticated user"""
        try:
            settings = self.service.get_user_settings(request.user.id)
            return api_response(data=settings)
        except Exception as e:
            return api_response(error={"code": "FETCH_ERROR", "message": str(e)}, status=500)

    def retrieve(self, request, pk=None):
        """Get settings for a specific provider"""
        try:
            settings = self.service.get_provider_settings(request.user.id, pk)
            return api_response(data=settings)
        except NotFoundException as e:
            return api_response(error={"code": "NOT_FOUND", "message": str(e)}, status=404)

    def create(self, request):
        """Create provider settings"""
        try:
            settings = self.service.update_provider_settings(
                request.user.id, request.data.get("provider_type"), request.data
            )
            return api_response(data=settings, status=201)
        except ValidationError as e:
            return api_response(error={"code": "VALIDATION_ERROR", "message": str(e)}, status=400)

    def update(self, request, pk=None):
        """Update provider settings"""
        try:
            settings = self.service.update_provider_settings(request.user.id, pk, request.data)
            return api_response(data=settings)
        except ValidationError as e:
            return api_response(error={"code": "VALIDATION_ERROR", "message": str(e)}, status=400)

    def destroy(self, request, pk=None):
        """Delete provider settings"""
        try:
            self.service.delete_provider_settings(request.user.id, pk)
            return api_response(status=204)
        except NotFoundException as e:
            return api_response(error={"code": "NOT_FOUND", "message": str(e)}, status=404)

    @action(detail=True, methods=["post"])
    def test_connection(self, request, pk=None):
        """Test provider connection"""
        try:
            result = self.service.test_provider_connection(request.user.id, pk)
            return api_response(data={"status": "success"})
        except Exception as e:
            return api_response(error={"code": "CONNECTION_ERROR", "message": str(e)}, status=400)
