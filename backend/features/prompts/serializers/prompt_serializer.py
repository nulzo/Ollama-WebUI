from rest_framework import serializers
import logging


class PromptRequestSerializer(serializers.Serializer):
    style = serializers.CharField(required=False, max_length=50, allow_blank=True)
    count = serializers.IntegerField(required=False, default=5, min_value=1, max_value=10)
    model = serializers.CharField(required=False, max_length=100, default="llama3.2:3b")

    def validate_style(self, value):
        """Validate the style parameter"""
        if value and value.lower() not in ["", "default", "creative", "analytical", "inspirational", "casual"]:
            valid_styles = ["", "default", "creative", "analytical", "inspirational", "casual"]
            raise serializers.ValidationError(f"Invalid style. Must be one of: {valid_styles}")
        return value

    def validate_model(self, value):
        """Validate the model parameter"""
        logger = logging.getLogger(__name__)
        logger.info(f"Validating model: {value}")
        
        # Add any model validation logic here if needed
        if not value:
            logger.warning("Model value is empty, using default")
            return "llama3.2:3b"
        
        # Log the model value for debugging
        logger.info(f"Using model: {value}")
        
        return value
