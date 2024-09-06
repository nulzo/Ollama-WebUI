from rest_framework import serializers
from api.models.message import Message
from api.serializers.liked_messages import LikedMessageSerializer
from django.contrib.contenttypes.models import ContentType


class MessageSerializer(serializers.ModelSerializer):
    liked_by = LikedMessageSerializer(many=True, read_only=True)
    sender_type = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = '__all__'

    def get_sender_type(self, obj):
        return ContentType.objects.get_for_id(obj.content_type_id).model
    