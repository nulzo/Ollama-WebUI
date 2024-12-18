from rest_framework import serializers
from api.models.chat.custom_prompt import CustomPrompt


class CustomPromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomPrompt
        fields = ["id", "title", "command", "content", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_command(self, value):
        # Ensure command contains only lowercase letters, numbers, and hyphens
        if not value.islower() or " " in value:
            raise serializers.ValidationError(
                "Command must be lowercase and contain no spaces. Use hyphens instead."
            )
        return value
