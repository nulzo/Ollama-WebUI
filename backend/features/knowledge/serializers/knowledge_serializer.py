from rest_framework import serializers

from features.knowledge.models import Knowledge


class KnowledgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Knowledge
        fields = [
            "id", 
            "name", 
            "identifier", 
            "content", 
            "created_at", 
            "updated_at",
            "file_path",
            "file_size",
            "file_type",
            "status",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "file_path", "file_size", "file_type", "status"]

    def create(self, validated_data):
        user = self.context["request"].user
        return Knowledge.objects.create(user=user, **validated_data)
