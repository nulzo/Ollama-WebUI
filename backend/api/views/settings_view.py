from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models.settings.settings import Settings, ProviderSettings
from api.serializers.settings import SettingsSerializer, ProviderSettingsSerializer

class ProviderSettingsViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProviderSettingsSerializer
    def get_queryset(self):
       return ProviderSettings.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
       serializer.save(user=self.request.user)
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        providers = request.data.get('providers', [])
        updated_settings = []
        
        for provider_data in providers:
           provider_type = provider_data.get('provider_type')
           provider_setting, _ = ProviderSettings.objects.get_or_create(
               user=request.user,
               provider_type=provider_type
           )
           serializer = self.get_serializer(provider_setting, data=provider_data)
           if serializer.is_valid():
               serializer.save()
               updated_settings.append(serializer.data)
       
        return Response(updated_settings)
    
class SettingsViewSet(viewsets.ModelViewSet):
   permission_classes = [IsAuthenticated]
   serializer_class = SettingsSerializer
   
   def get_queryset(self):
       return Settings.objects.filter(user=self.request.user)
   
   def perform_create(self, serializer):
       serializer.save(user=self.request.user)