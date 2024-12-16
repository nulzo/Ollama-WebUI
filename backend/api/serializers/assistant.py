from rest_framework import serializers

from api.models.chat.assistant import Assistant


class AssistantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assistant
        fields = "__all__"
