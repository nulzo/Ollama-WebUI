from rest_framework import serializers
from api.models.chat.conversation import Conversation
from api.serializers.message import MessageSerializer


class ConversationSerializer(serializers.ModelSerializer):
    # messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = "__all__"
