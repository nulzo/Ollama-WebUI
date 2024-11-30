from rest_framework import serializers
from api.models.settings.settings import Settings, ProviderSettings

class ProviderSettingsSerializer(serializers.ModelSerializer):
   class Meta:
       model = ProviderSettings
       fields = [
           'id',
           'provider_type',
           'api_key',
           'endpoint',
           'organization_id',
           'is_enabled'
       ]
       extra_kwargs = {
           'api_key': {'write_only': True},
           'id': {'read_only': True}
       }

class SettingsSerializer(serializers.ModelSerializer):
   providers = ProviderSettingsSerializer(many=True, read_only=True, source='providersettings_set')
   
   class Meta:
       model = Settings
       fields = [
           'id',
           'theme',
           'default_model',
           'providers'
       ]
       read_only_fields = ['id']
