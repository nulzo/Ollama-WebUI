from datetime import datetime
from django.conf import settings
from api.utils.responses.response import api_response
from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from api.services.agent_service import AgentService
from api.serializers.agent_serializer import AgentSerializer
from api.models.agent.agent import Agent
from api.utils.exceptions import ServiceError, ValidationError
from api.utils.pagination import StandardResultsSetPagination
import logging

logger = logging.getLogger(__name__)

class AgentViewSet(mixins.CreateModelMixin,
                  mixins.ListModelMixin,
                  mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin,
                  mixins.DestroyModelMixin,
                  viewsets.GenericViewSet):
    """
    ViewSet for handling agent operations.

    list: Get all agents for the authenticated user
    create: Create a new agent
    retrieve: Get a specific agent
    update: Update an agent
    destroy: Delete an agent
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AgentSerializer
    pagination_class = StandardResultsSetPagination
    lookup_field = 'id'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.agent_service = AgentService()
        self.logger = logging.getLogger(__name__)

    def get_queryset(self):
        return self.agent_service.list_agents(self.request.user.id)

    def list(self, request, *args, **kwargs):
        try:
            agents = self.get_queryset()
            serializer = self.get_serializer(agents, many=True)
            return api_response(
                data=serializer.data,
                links={
                    "self": request.build_absolute_uri()
                }
            )
        except Exception as e:
            self.logger.error(f"Error listing agents: {str(e)}")
            return api_response(
                error={
                    "code": "AGENT_LIST_ERROR",
                    "message": "Failed to list agents",
                    "details": str(e)
                },
                status=500
            )

    def create(self, request, *args, **kwargs):
        try:
            data = request.data
            data['user'] = request.user
            agent = self.agent_service.create_agent(data)
            serializer = self.get_serializer(agent)
            return api_response(
                data=serializer.data,
                links={
                    "self": request.build_absolute_uri()
                },
                status=201
            )
        except ValidationError as e:
            self.logger.warning(f"Validation error: {str(e)}")
            return api_response(
                error={
                    "code": "VALIDATION_ERROR",
                    "message": str(e)
                },
                status=400
            )
        except Exception as e:
            self.logger.error(f"Error creating agent: {str(e)}")
            return api_response(
                error={
                    "code": "AGENT_CREATE_ERROR",
                    "message": "Failed to create agent",
                    "details": str(e)
                },
                status=500
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            agent = self.agent_service.get_agent(kwargs['id'])
            serializer = self.get_serializer(agent)
            return api_response(
                data=serializer.data,
                links={
                    "self": request.build_absolute_uri()
                }
            )
        except Exception as e:
            self.logger.error(f"Error retrieving agent: {str(e)}")
            return api_response(
                error={
                    "code": "AGENT_FETCH_ERROR",
                    "message": "Failed to fetch agent",
                    "details": str(e)
                },
                status=500
            )

    def update(self, request, *args, **kwargs):
        try:
            agent = self.agent_service.update_agent(kwargs['id'], request.data)
            serializer = self.get_serializer(agent)
            return api_response(
                data=serializer.data,
                links={
                    "self": request.build_absolute_uri()
                }
            )
        except ValidationError as e:
            self.logger.warning(f"Validation error: {str(e)}")
            return api_response(
                error={
                    "code": "VALIDATION_ERROR",
                    "message": str(e)
                },
                status=400
            )
        except Exception as e:
            self.logger.error(f"Error updating agent: {str(e)}")
            return api_response(
                error={
                    "code": "AGENT_UPDATE_ERROR",
                    "message": "Failed to update agent",
                    "details": str(e)
                },
                status=500
            )

    def destroy(self, request, *args, **kwargs):
        try:
            self.agent_service.delete_agent(kwargs['pk'])
            return api_response(status=204)
        except Exception as e:
            self.logger.error(f"Error deleting agent: {str(e)}")
            return api_response(
                error={
                    "code": "AGENT_DELETE_ERROR",
                    "message": "Failed to delete agent",
                    "details": str(e)
                },
                status=500
            )