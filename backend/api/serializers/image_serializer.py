from rest_framework import serializers
from api.models.chat.image import MessageImage

class MessageImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageImage
        fields = ['id', 'image', 'order', 'created_at']