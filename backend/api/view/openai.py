from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from services.openai.openai import OpenAIService
from django.http import StreamingHttpResponse
import json


class OpenAIChat(APIView):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.openai_service = OpenAIService()

    def post(self, request, *args, **kwargs):
        data = request.data
        model = data.get('model')
        messages = data.get('messages', [])
        stream = data.get('stream', True)

        if not model or not messages:
            return Response({"error": "Model and messages are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if stream:
                generator = self.openai_service.chat_stream(model=model, messages=messages)
                return StreamingHttpResponse(
                    (f"data: {json.dumps(chunk)}\n\n" for chunk in generator),
                    content_type='text/event-stream'
                )
            else:
                response = self.openai_service.chat(model=model, messages=messages, stream=False)
                return Response(response, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OpenAIModels(APIView):

    def get(self, request):
        try:
            openai_service = OpenAIService()
            models = openai_service.model_list()
            return Response([model.model_dump() for model in models.data], status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
