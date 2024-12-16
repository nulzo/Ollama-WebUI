import logging

from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from api.serializers.tool_serializer import ToolSerializer
from api.services.tool_service import ToolService
from api.utils.exceptions import ValidationError
from api.utils.pagination import StandardResultsSetPagination
from api.utils.responses.response import api_response

logger = logging.getLogger(__name__)


class ToolViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for handling tool operations.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ToolSerializer
    pagination_class = StandardResultsSetPagination
    lookup_field = "id"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.tool_service = ToolService()
        self.logger = logger

    def get_queryset(self):
        """Filter tools for the authenticated user unless staff/superuser"""
        if self.request.user.is_staff or self.request.user.is_superuser:
            return self.tool_service.list_tools()
        return self.tool_service.get_user_tools(self.request.user.id)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)
            serializer = self.get_serializer(page, many=True)
            return api_response(
                data=self.get_paginated_response(serializer.data).data,
                links={"self": request.build_absolute_uri()},
            )
        except Exception as e:
            self.logger.error(f"Error fetching tools: {str(e)}")
            return api_response(
                error={
                    "code": "TOOL_FETCH_ERROR",
                    "message": "Failed to fetch tools",
                    "details": str(e),
                },
                status=500,
            )

    def create(self, request, *args, **kwargs):
        try:
            data = request.data
            data["created_by"] = request.user
            tool = self.tool_service.create_tool(data)
            serializer = self.get_serializer(tool)
            return api_response(
                data=serializer.data, status=201, links={"self": request.build_absolute_uri()}
            )
        except ValidationError as e:
            return api_response(error={"code": "VALIDATION_ERROR", "message": str(e)}, status=400)
        except Exception as e:
            self.logger.error(f"Error creating tool: {str(e)}")
            return api_response(
                error={
                    "code": "TOOL_CREATE_ERROR",
                    "message": "Failed to create tool",
                    "details": str(e),
                },
                status=500,
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            tool = self.tool_service.get_tool(kwargs["id"])
            serializer = self.get_serializer(tool)
            return api_response(data=serializer.data, links={"self": request.build_absolute_uri()})
        except ValidationError as e:
            return api_response(error={"code": "VALIDATION_ERROR", "message": str(e)}, status=400)
        except Exception as e:
            self.logger.error(f"Error retrieving tool: {str(e)}")
            return api_response(
                error={
                    "code": "TOOL_FETCH_ERROR",
                    "message": "Failed to fetch tool",
                    "details": str(e),
                },
                status=500,
            )

    def update(self, request, *args, **kwargs):
        try:
            tool = self.tool_service.update_tool(
                tool_id=kwargs["id"], user=request.user, data=request.data
            )
            serializer = self.get_serializer(tool)
            return api_response(data=serializer.data, links={"self": request.build_absolute_uri()})
        except ValidationError as e:
            return api_response(error={"code": "VALIDATION_ERROR", "message": str(e)}, status=400)
        except Exception as e:
            self.logger.error(f"Error updating tool: {str(e)}")
            return api_response(
                error={
                    "code": "TOOL_UPDATE_ERROR",
                    "message": "Failed to update tool",
                    "details": str(e),
                },
                status=500,
            )

    def destroy(self, request, *args, **kwargs):
        try:
            self.tool_service.delete_tool(tool_id=kwargs["id"], user=request.user)
            return api_response(status=204)
        except Exception as e:
            self.logger.error(f"Error deleting tool: {str(e)}")
            return api_response(
                error={
                    "code": "TOOL_DELETE_ERROR",
                    "message": "Failed to delete tool",
                    "details": str(e),
                },
                status=500,
            )
