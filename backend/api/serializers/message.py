import uuid
from rest_framework import serializers
from api.models.messages.message import Message
from api.serializers.liked_messages import LikedMessageSerializer
from api.models.assistant.assistant import Assistant
from api.models.users.user import CustomUser
from api.models.conversation.conversation import Conversation
from api.repositories.message_repository import MessageRepository

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
    conversation = serializers.UUIDField(required=False, allow_null=True)
    image_ids = serializers.ListField(child=serializers.IntegerField(), read_only=True)
    images = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_repository = MessageRepository()
        
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'role', 'content', 'created_at', 
                 'model', 'user', 'liked_by', 'has_images', 'image_ids', 'images']

    def validate_conversation(self, value):
        if value:
            try:
                return uuid.UUID(str(value), version=4)
            except ValueError:
                raise serializers.ValidationError("Invalid UUID format")
        return None

    def create(self, validated_data):
        conversation_uuid = validated_data.pop('conversation', None)
        images = validated_data.pop('images', [])
        user = self.context['request'].user

        if conversation_uuid:
            try:
                conversation = Conversation.objects.get(uuid=conversation_uuid, user=user)
            except Conversation.DoesNotExist:
                raise serializers.ValidationError({
                    "conversation": "Conversation not found or you do not have permission."
                })
        else:
            conversation = Conversation.objects.create(user=user, name=validated_data.get('content', ''))

        validated_data['conversation'] = conversation
        validated_data['has_images'] = bool(images)
        
        message = self.message_repository.create({
            **validated_data,
            'images': images
        })

        return message
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['conversation_uuid'] = str(instance.conversation.uuid)
        if instance.has_images:
            representation['image_ids'] = list(
                instance.message_images.values_list('id', flat=True)
            )
        return representation


class MessageListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for message lists"""
    class Meta:
        model = Message
        fields = ['id', 'role', 'created_at', 'conversation']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['conversation_uuid'] = str(instance.conversation.uuid)
        return representation