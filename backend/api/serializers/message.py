from rest_framework import serializers
from api.models.messages.message import Message
from api.serializers.liked_messages import LikedMessageSerializer
from api.models.assistant.assistant import Assistant
from api.models.users.user import CustomUser
from api.models.conversation.conversation import Conversation
import uuid

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
            # Create a new assistant if it does not exist
            assistant = Assistant.objects.create(name=data)
            return assistant

class MessageSerializer(serializers.ModelSerializer):
    liked_by = LikedMessageSerializer(many=True, read_only=True)
    user = UserField(queryset=CustomUser.objects.all())
    model = AssistantField(queryset=Assistant.objects.all())
    conversation_uuid = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Message
        fields = "__all__"

    def create(self, validated_data):
        conversation_uuid = validated_data.pop('conversation', None)
        print(conversation_uuid)
        user = self.context['request'].user

        if conversation_uuid:
            try:
                conversation = Conversation.objects.get(uuid=conversation_uuid, user=user)
            except Conversation.DoesNotExist:
                raise serializers.ValidationError({
                    "conversation_uuid": "Invalid conversation UUID or you do not have permission."
                })
        else:
            # Create a new Conversation if no UUID is provided
            conversation = Conversation.objects.create(user=user)
        print(conversation)
        message = Message.objects.create(conversation=conversation, **validated_data)
        return message

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['conversation_uuid'] = instance.conversation.uuid
        return representation