from rest_framework import serializers

from features.completions.models import MessageImage


class MessageImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageImage
        fields = ["id", "image", "order", "created_at"]
