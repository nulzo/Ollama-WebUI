from rest_framework import serializers
from api.models.messages.message import Message
from api.serializers.liked_messages import LikedMessageSerializer
from api.models.assistant.assistant import Assistant
from api.models.users.user import CustomUser
import logging

logger = logging.getLogger(__name__)


class UserField(serializers.RelatedField):
    def to_representation(self, value):
        return value.username

    def to_internal_value(self, data):
        try:
            return CustomUser.objects.get(username=data)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User does not exist")
        

class AssistantField(serializers.RelatedField):
    def to_representation(self, value):
        return value.name

    def to_internal_value(self, data):
        try:
            return Assistant.objects.get(name=data)
        except Assistant.DoesNotExist:
            raise serializers.ValidationError("Assistant does not exist")


class MessageSerializer(serializers.ModelSerializer):
    liked_by = LikedMessageSerializer(many=True, read_only=True)
    user = UserField(queryset=CustomUser.objects.all())
    model = AssistantField(queryset=Assistant.objects.all())

    class Meta:
        model = Message
        fields = "__all__"
