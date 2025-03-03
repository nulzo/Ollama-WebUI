from rest_framework import serializers
from django.contrib.auth import get_user_model
from features.authentication.models import CustomUser, Settings
from features.authentication.serializers.settings import SettingsSerializer


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
    settings = serializers.SerializerMethodField()

    def get_settings(self, obj):
        try:
            settings = Settings.objects.get(user=obj)
            settings_data = SettingsSerializer(settings).data
            
            # Ensure prompt_settings is included
            if settings.prompt_settings is None:
                settings_data['prompt_settings'] = {
                    'use_llm_generated': False,
                    'model': 'llama3.2:3b'
                }
            elif not isinstance(settings.prompt_settings, dict):
                # Handle case where prompt_settings is not a dict
                print(f"Warning: prompt_settings is not a dict: {settings.prompt_settings}")
                settings_data['prompt_settings'] = {
                    'use_llm_generated': False,
                    'model': 'llama3.2:3b'
                }
            elif 'use_llm_generated' not in settings.prompt_settings:
                # Ensure use_llm_generated is present
                settings_data['prompt_settings']['use_llm_generated'] = False
            
            print(f"Returning settings data: {settings_data}")
            return settings_data
        except Settings.DoesNotExist:
            # Create default settings if they don't exist
            settings = Settings.objects.create(
                user=obj,
                prompt_settings={
                    'use_llm_generated': False,
                    'model': 'llama3.2:3b'
                }
            )
            return SettingsSerializer(settings).data

    class Meta:
        model = User
        fields = (
        'id', 'username', 'email', 'first_name', 'last_name', 'name', 'description', 'icon', 'created_at', 'last_login', 'settings')
        read_only_fields = fields


class UserUpdateSerializer(serializers.ModelSerializer):
    # Map full_name to the model field "name"
    full_name = serializers.CharField(source='name', required=False, allow_blank=True)
    # Map avatar to the model field "icon". Use ImageField if it's an image.
    avatar = serializers.ImageField(source='icon', required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'full_name', 'description', 'avatar')


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)