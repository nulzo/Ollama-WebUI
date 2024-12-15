from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models.chat.image import MessageImage
from api.serializers.image_serializer import MessageImageSerializer
import base64

class MessageImageViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageImageSerializer

    def get_queryset(self):
        return MessageImage.objects.filter(
            message__conversation__user=self.request.user
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            # Read the file content
            instance.image.seek(0)  # Ensure we're at the start of the file
            image_bytes = instance.image.read()
            image_data = base64.b64encode(image_bytes).decode('utf-8')
            
            return Response({
                'data': {  # Wrap in data object to match expected format
                    'id': instance.id,
                    'image': f"data:image/jpeg;base64,{image_data}",
                    'order': instance.order
                }
            })
        except Exception as e:
            return Response(
                {'error': f'Error processing image: {str(e)}'}, 
                status=500
            )