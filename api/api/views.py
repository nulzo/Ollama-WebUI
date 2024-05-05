from rest_framework import generics
from api.models.user import UserSettings
from api.models.chat import Chat
from api.models.message import Message
from api.serializers.message import MessageSerializer
from api.serializers.user import UserSerializer
from api.serializers.chat import ChatSerializer


class ChatList(generics.ListCreateAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer


class ChatDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer


class MessageList(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_queryset(self):
        queryset = Message.objects.all()
        chat_id = self.request.query_params.get('chat', None)
        if chat_id is not None:
            queryset = queryset.filter(chat__id=chat_id)
        return queryset


class MessageDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer


class UserSettingsList(generics.ListCreateAPIView):
    queryset = UserSettings.objects.all()
    serializer_class = UserSerializer


class UserSettingsDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserSettings.objects.all()
    serializer_class = UserSerializer
