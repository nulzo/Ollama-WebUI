from rest_framework import serializers
from api.models.pinned_messages import PinnedMessage


class PinnedMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PinnedMessage
        fields = '__all__'
