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
        chat_uuid = self.request.query_params.get("chat", None)
        if chat_uuid is not None:
            queryset = queryset.filter(chat__uuid=chat_uuid)
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
