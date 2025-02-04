from features.agents.serializers.agent_serializer import AgentSerializer
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
            serializer = AgentSerializer(agents, many=True)
            return api_response(data=serializer.data)
        except Exception as e:
            return api_response(error={"code": "FETCH_ERROR", "message": str(e)}, status=500)

    def retrieve(self, request, pk=None):
        """Get a specific agent"""
        try:
            agent = self.service.get_agent(pk)
            serializer = AgentSerializer(agent)
            return api_response(data=serializer.data)
        except NotFoundException as e:
            return api_response(error={"code": "NOT_FOUND", "message": str(e)}, status=404)

    def create(self, request):
        """Create a new agent"""
        try:
            serializer = AgentSerializer(data=request.data)
            if serializer.is_valid():
                data = serializer.validated_data
                data['user'] = request.user
                agent = self.service.create_agent(data)
                return api_response(data=AgentSerializer(agent).data, status=201)
            return api_response(error={"code": "VALIDATION_ERROR", "message": serializer.errors}, status=400)
        except Exception as e:
            return api_response(error={"code": "CREATE_ERROR", "message": str(e)}, status=400)

    def update(self, request, pk=None):
        """Update an agent"""
        try:
            agent = self.service.get_agent_by_uuid(pk)
            serializer = AgentSerializer(agent, data=request.data, partial=True)
            if serializer.is_valid():
                updated_agent = serializer.save()
                return api_response(data=AgentSerializer(updated_agent).data)
            return api_response(error={"code": "VALIDATION_ERROR", "message": serializer.errors}, status=400)
        except NotFoundException as e:
            return api_response(error={"code": "NOT_FOUND", "message": str(e)}, status=404)
        except Exception as e:
            return api_response(error={"code": "UPDATE_ERROR", "message": str(e)}, status=400)

    def destroy(self, request, pk=None):
        """Delete an agent"""
        try:
            self.service.delete_agent_by_uuid(pk)
            return api_response(status=204)
        except NotFoundException as e:
            return api_response(error={"code": "NOT_FOUND", "message": str(e)}, status=404)
        except Exception as e:
            return api_response(error={"code": "DELETE_ERROR", "message": str(e)}, status=400)