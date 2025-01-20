from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from features.agents.services.agent_service import AgentService
from api.utils.exceptions import ValidationError, NotFoundException
from api.utils.responses.response import api_response


class AgentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = AgentService()

    def list(self, request):
        """List all agents for the authenticated user"""
        try:
            agents = self.service.list_agents(request.user.id)
            return api_response(data=agents)
        except Exception as e:
            return api_response(error={"code": "FETCH_ERROR", "message": str(e)}, status=500)

    def retrieve(self, request, pk=None):
        """Get a specific agent"""
        try:
            agent = self.service.get_agent(pk)
            return api_response(data=agent)
        except NotFoundException as e:
            return api_response(error={"code": "NOT_FOUND", "message": str(e)}, status=404)

    def create(self, request):
        """Create a new agent"""
        try:
            data = {**request.data, "user": request.user}
            agent = self.service.create_agent(data)
            return api_response(data=agent, status=201)
        except ValidationError as e:
            return api_response(error={"code": "VALIDATION_ERROR", "message": str(e)}, status=400)

    def update(self, request, pk=None):
        """Update an agent"""
        try:
            agent = self.service.update_agent(pk, request.data)
            return api_response(data=agent)
        except ValidationError as e:
            return api_response(error={"code": "VALIDATION_ERROR", "message": str(e)}, status=400)
        except NotFoundException as e:
            return api_response(error={"code": "NOT_FOUND", "message": str(e)}, status=404)

    def destroy(self, request, pk=None):
        """Delete an agent"""
        try:
            self.service.delete_agent(pk)
            return api_response(status=204)
        except NotFoundException as e:
            return api_response(error={"code": "NOT_FOUND", "message": str(e)}, status=404)
