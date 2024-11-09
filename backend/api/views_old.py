import uuid
from rest_framework import generics
from api.models.users.user import CustomUser
from api.models.conversation.conversation import Conversation
from api.models.messages.message import Message
from api.serializers.message import MessageSerializer
from api.serializers.user import UserSerializer
from api.serializers.conversation import ConversationSerializer
from api.serializers.settings import SettingsSerializer
from api.models.settings.settings import Settings
from api.models.assistant.assistant import Assistant
from api.serializers.assistant import AssistantSerializer
from rest_framework import viewsets
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated


class AssistantViewSet(viewsets.ModelViewSet):
    queryset = Assistant.objects.all()
    serializer_class = AssistantSerializer


class ConversationList(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response({'uuid': response.data['uuid']}, status=status.HTTP_201_CREATED)


class ConversationDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)


class MessageList(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Message.objects.filter(conversation__user=self.request.user)
        chat_uuid = self.request.query_params.get("c", None)
        if chat_uuid and chat_uuid.strip():
            try:
                uuid.UUID(chat_uuid)
                queryset = queryset.filter(conversation__uuid=chat_uuid)
            except ValueError:
                queryset = Message.objects.none()
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        headers = self.get_success_headers(serializer.data)

        response_data = MessageSerializer(message, context={'request': request}).data
        response_data['conversation_uuid'] = str(message.conversation.uuid)

        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)


class MessageDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        return Message.objects.filter(conversation__user=self.request.user)


class UserSettingsList(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


class UserSettingsDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


class SettingsList(generics.ListCreateAPIView):
    queryset = Settings.objects.all()
    serializer_class = SettingsSerializer


class SettingsDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Settings.objects.all()
    serializer_class = SettingsSerializer

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)
    

class CurrentUserView(generics.RetrieveAPIView):
    """
    Retrieve the currently authenticated user.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
