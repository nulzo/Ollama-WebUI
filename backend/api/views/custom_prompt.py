from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from api.serializers.custom_prompt_serializer import CustomPromptSerializer
from api.models.chat.custom_prompt import CustomPrompt
from api.utils.responses.response import api_response


class CustomPromptViewSet(viewsets.ModelViewSet):
    """ViewSet for managing saved prompts."""

    serializer_class = CustomPromptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get all saved prompts for the current user"""
        return CustomPrompt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Create a new saved prompt"""
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                error={
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid data provided",
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        self.perform_create(serializer)
        return api_response(data=serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return api_response(
                data={"message": "Saved prompt successfully deleted"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return api_response(
                error={
                    "code": "DELETE_ERROR",
                    "message": "Failed to delete saved prompt",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
