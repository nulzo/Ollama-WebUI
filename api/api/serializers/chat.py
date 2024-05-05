from rest_framework import serializers
from api.models.chat import Chat
from api.serializers.message import MessageSerializer


class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = "__all__"
