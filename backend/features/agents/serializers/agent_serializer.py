from rest_framework import serializers
from features.agents.models import Agent

class AgentSerializer(serializers.ModelSerializer):
    enabled = serializers.BooleanField(source='parameters.enabled', default=True)
    files = serializers.BooleanField(source='parameters.files', default=False)
    function_call = serializers.BooleanField(source='parameters.function_call', default=False)
    vision = serializers.BooleanField(source='parameters.vision', default=False)
    max_output = serializers.IntegerField(source='parameters.max_output', default=2048)
    tokens = serializers.IntegerField(source='parameters.tokens', default=2048)
    num_ctx = serializers.IntegerField(source='parameters.num_ctx', default=4096)
    low_vram = serializers.BooleanField(source='parameters.low_vram', default=False)
    embedding_only = serializers.BooleanField(source='parameters.embedding_only', default=False)
    seed = serializers.IntegerField(source='parameters.seed', default=0)
    num_predict = serializers.IntegerField(source='parameters.num_predict', default=128)
    temperature = serializers.FloatField(source='parameters.temperature', default=0.8)
    top_k = serializers.IntegerField(source='parameters.top_k', default=40)
    top_p = serializers.FloatField(source='parameters.top_p', default=0.95)
    tfs_z = serializers.FloatField(source='parameters.tfs_z', default=1.0)
    typical_p = serializers.FloatField(source='parameters.typical_p', default=1.0)
    repeat_last_n = serializers.IntegerField(source='parameters.repeat_last_n', default=64)
    repeat_penalty = serializers.FloatField(source='parameters.repeat_penalty', default=1.1)
    presence_penalty = serializers.FloatField(source='parameters.presence_penalty', default=0.0)
    frequency_penalty = serializers.FloatField(source='parameters.frequency_penalty', default=0.0)
    penalize_newline = serializers.BooleanField(source='parameters.penalize_newline', default=False)
    stop = serializers.ListField(source='parameters.stop', default=list)

    class Meta:
        model = Agent
        fields = (
            'id', 'display_name', 'description', 'icon', 'model', 'system_prompt',
            'enabled', 'files', 'function_call', 'vision', 'max_output', 'tokens',
            'num_ctx', 'low_vram', 'embedding_only', 'seed', 'num_predict',
            'temperature', 'top_k', 'top_p', 'tfs_z', 'typical_p', 'repeat_last_n',
            'repeat_penalty', 'presence_penalty', 'frequency_penalty',
            'penalize_newline', 'stop', 'created_at', 'updated_at', 'user'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'user')

    def create(self, validated_data):
        parameters = validated_data.pop('parameters', {})
        agent = Agent.objects.create(**validated_data)
        agent.parameters = parameters
        agent.save()
        return agent
    
    def update(self, instance, validated_data):
        """Update an agent instance"""
        # Handle nested parameters data
        parameters_data = {}
        for field_name, field in self.fields.items():
            if hasattr(field, 'source') and field.source and field.source.startswith('parameters.'):
                param_key = field.source.split('parameters.')[1]
                if field_name in validated_data:
                    parameters_data[param_key] = validated_data.pop(field_name)

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update parameters
        if parameters_data:
            instance.parameters = {
                **instance.parameters,
                **parameters_data
            }

        instance.save()
        return instance

    def to_internal_value(self, data):
        """
        Transform the incoming data before validation
        """
        ret = super().to_internal_value(data)
        
        # Handle parameters fields
        parameters = {}
        for field_name, field in self.fields.items():
            if hasattr(field, 'source') and field.source and field.source.startswith('parameters.'):
                param_key = field.source.split('parameters.')[1]
                if field_name in data:
                    parameters[param_key] = data[field_name]
        
        if parameters:
            ret['parameters'] = parameters
            
        return ret

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        parameters = instance.parameters or {}
        for key, value in parameters.items():
            if key in self.fields and hasattr(self.fields[key], 'source'):
                ret[key] = value
        return ret