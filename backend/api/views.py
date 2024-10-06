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
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer


class ConversationDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer


class MessageList(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_queryset(self):
        queryset = Message.objects.all()
        chat_uuid = self.request.query_params.get("c", None)
        print(chat_uuid)
        if chat_uuid is not None:
            queryset = queryset.filter(conversation_id=chat_uuid)
        return queryset


class MessageDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer


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
