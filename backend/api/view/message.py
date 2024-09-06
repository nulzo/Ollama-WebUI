from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from services.ollama.ollama import ollama_client

from api.serializers.message import MessageSerializer

class MessageView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            messages = serializer.validated_data.get('messages')
            model = serializer.validated_data.get('model')

            # Interact with the Ollama SDK
            response = ollama_client.chat(model=model, messages=messages, stream=False)
            print(type(response))
            # if response.status_code == 200:
            #     # Assuming Ollama returns a JSON response with the key 'response'
            #     ollama_response = response.json().get('response', '')
            #     return Response({"response": ollama_response}, status=status.HTTP_200_OK)
            # else:
            #     return Response({"error": "Ollama API call failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, *args, **kwargs):
        serializer 