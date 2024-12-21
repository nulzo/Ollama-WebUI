from rest_framework import serializers
from django.contrib.auth import get_user_model
from api.models.auth.user import CustomUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = "__all__"

User = get_user_model()


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'name', 'description')
        read_only_fields = ('id',)


class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
        'id', 'username', 'email', 'first_name', 'last_name', 'name', 'description', 'icon', 'created_at', 'last_login')
        read_only_fields = fields


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'name', 'description', 'icon')


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)