from rest_framework import serializers

class PromptRequestSerializer(serializers.Serializer):
    style = serializers.CharField(
        required=False,
        max_length=50,
        allow_blank=True
    )
    count = serializers.IntegerField(
        required=False,
        default=5,
        min_value=1,
        max_value=10
    )
    
    def validate_style(self, value):
        valid_styles = {'creative', 'analytical', 'casual', 'professional'}
        if value and value not in valid_styles:
            raise serializers.ValidationError(
                f"Invalid style. Must be one of: {valid_styles}"
            )
        return value
