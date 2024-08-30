from rest_framework import serializers
from api.models.user import UserSettings


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = "__all__"
