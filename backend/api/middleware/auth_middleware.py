from django.http import JsonResponse
from rest_framework import status
from rest_framework.authtoken.models import Token
from asgiref.sync import sync_to_async

class AuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    async def __call__(self, request):
        if request.path in ['/api/auth/login/', '/api/auth/logout/', '/api/auth/register/']:
            return await self.get_response(request)

        # Check for token in the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Token '):
            token_key = auth_header.split(' ')[1]
            try:
                token = await sync_to_async(Token.objects.get)(key=token_key)
                request.user = await sync_to_async(getattr)(token, 'user')
            except Token.DoesNotExist:
                return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        response = await self.get_response(request)
        return response