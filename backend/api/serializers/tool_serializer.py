from rest_framework import serializers
from api.models.agent.tools import Tool
from api.serializers.user import UserSerializer

class ToolSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Tool
        fields = [
            'id',
            'name',
            'description',
            'function_content',
            'language',
            'parameters',
            'returns',
            'created_at',
            'modified_at',
            'created_by',
            'is_enabled'
        ]
        read_only_fields = ['created_at', 'modified_at']

    def create(self, validated_data):
        # Get the user from the context
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)
