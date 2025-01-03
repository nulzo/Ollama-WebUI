import uuid

from rest_framework import serializers

from api.models.auth.user import CustomUser
from api.models.chat.assistant import Assistant
from api.models.chat.conversation import Conversation
from api.models.chat.message import Message
from features.conversations.repositories.message_repository import MessageRepository
from api.serializers.liked_messages import LikedMessageSerializer


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
    """
    Serializer for Message model with support for:
    - Message creation and retrieval
    - Image handling
    - Conversation management
    - User association
    - Model/Assistant linking
    """

    # Read-only fields
    liked_by = LikedMessageSerializer(many=True, read_only=True)
    image_ids = serializers.ListField(child=serializers.IntegerField(), read_only=True)
    conversation_uuid = serializers.SerializerMethodField()

    # Write-only fields
    images = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True,
        help_text="List of base64 encoded image data URLs",
    )

    # Regular fields
    conversation = serializers.UUIDField(required=False, allow_null=True)
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=True)
    model = serializers.CharField(required=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "conversation_uuid",
            "role",
            "content",
            "created_at",
            "model",
            "user",
            "liked_by",
            "has_images",
            "image_ids",
            "images",
        ]
        read_only_fields = ["id", "created_at", "has_images"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_repository = MessageRepository()

    def get_conversation_uuid(self, obj):
        """Get the conversation UUID for the message"""
        return str(obj.conversation.uuid) if obj.conversation else None

    def validate_conversation(self, value):
        """Validate and convert conversation UUID"""
        if not value:
            return None
        try:
            return uuid.UUID(str(value))
        except ValueError:
            raise serializers.ValidationError("Invalid conversation UUID format")

    def validate_images(self, value):
        """Validate image data URLs"""
        if not value:
            return []

        for image in value:
            if not isinstance(image, str) or not image.startswith("data:"):
                raise serializers.ValidationError("Invalid image format. Must be base64 data URL")
        return value

    def create(self, validated_data):
        """Create a new message with proper relationship handling"""
        # Extract non-model fields
        conversation_uuid = validated_data.pop("conversation", None)
        images = validated_data.pop("images", [])
        user = validated_data["user"]
        print(validated_data)
        # Handle conversation creation/retrieval
        try:
            conversation = (
                Conversation.objects.get(uuid=conversation_uuid, user=user)
                if conversation_uuid
                else Conversation.objects.create(
                    user=user,
                    name=validated_data.get("content", "")[:100],  # Truncate name if needed
                )
            )
        except Conversation.DoesNotExist:
            raise serializers.ValidationError(
                {"conversation": "Conversation not found or access denied"}
            )
            # Prepare final data for creation
        validated_data.update(
            {
                "conversation": conversation,
                "has_images": bool(images),
            }
        )
        # Create message using repository
        try:
            return self.message_repository.create({**validated_data, "images": images})
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create message: {str(e)}")

    def to_representation(self, instance):
        """Convert message instance to JSON-serializable format"""
        data = super().to_representation(instance)

        # Add image IDs if present
        if instance.has_images:
            data["image_ids"] = list(instance.message_images.values_list("id", flat=True))

        return data


class MessageListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for message lists"""

    class Meta:
        model = Message
        fields = ["id", "role", "created_at", "conversation"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["conversation_uuid"] = str(instance.conversation.uuid)
        return representation
