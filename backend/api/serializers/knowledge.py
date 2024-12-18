from rest_framework import serializers

from api.models.agent.knowledge import Knowledge


class KnowledgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Knowledge
        fields = ["id", "name", "identifier", "content", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        user = self.context["request"].user
        return Knowledge.objects.create(user=user, **validated_data)
