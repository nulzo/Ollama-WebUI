from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from services.message.message_service import MessageService


class MessageView(APIView):
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.message_service = MessageService()

    def post(self, request, *args, **kwargs):
        response = self.message_service.handle_user_message(request.data)

        if "errors" in response:
            return Response(response, status=status.HTTP_400_BAD_REQUEST)
        if not response['done']:
            return Response(response, status=status.HTTP_400_BAD_REQUEST)
        return Response(response, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        messages = self.message_service.message_repository.get_all_messages()
        return Response([str(value) for value in messages])
