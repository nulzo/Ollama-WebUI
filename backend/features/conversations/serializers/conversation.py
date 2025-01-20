from rest_framework import serializers

from features.conversations.models import Conversation


class ConversationSerializer(serializers.ModelSerializer):
    # messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = "__all__"
