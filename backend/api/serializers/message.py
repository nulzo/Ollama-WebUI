from rest_framework import serializers
from api.models.messages.message import Message
from api.serializers.liked_messages import LikedMessageSerializer
from api.models.sender.sender import Sender
from api.serializers.sender import SenderSerializer
import logging

logger = logging.getLogger(__name__)


class MessageSerializer(serializers.ModelSerializer):
    liked_by = LikedMessageSerializer(many=True, read_only=True)
    sender = SenderSerializer()

    class Meta:
        model = Message
        fields = "__all__"

    def validate_sender(self, sender_id):
        try:
            return Sender.objects.get(pk=sender_id)
        except Sender.DoesNotExist as exception:
            logger.debug(f"{exception}.. Attempting to create a new sender.")
            raise serializers.ValidationError("Sender does not exist")
        
    def get_message_content(self):
        return self.validated_data.get("content")
    
    def get_conversation(self):
        return self.validated_data.get("conversation")
    
    def get_meta_user(self):
        return self.validated_data.get("meta_user")
    
    def get_meta_model(self):
        return self.validated_data.get("meta_model")
    
    def get_sender(self):
        return self.validated_data.get("sender")
