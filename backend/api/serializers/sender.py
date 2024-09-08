from rest_framework import serializers
from api.models.sender.sender import Sender
from api.serializers.user import UserSerializer
from api.serializers.assistant import AssistantSerializer

class SenderSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    assistant = serializers.SerializerMethodField()

    class Meta:
        model = Sender
        fields = ["user", "assistant"]

    def get_user(self, obj):
        user = obj.get_user()
        if user:
            return UserSerializer(user).data
        return None

    def get_assistant(self, obj):
        assistant = obj.get_assistant()
        if assistant:
            return AssistantSerializer(assistant).data
        return None