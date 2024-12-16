from rest_framework import serializers

from api.models.agent.agent import Agent


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = "__all__"
        read_only_fields = ("created_at", "modified_at", "user")
