from django.http import JsonResponse
from rest_framework import status
from rest_framework.authtoken.models import Token

class AuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path in ['/api/v1/login/', '/api/v1/logout/']:
            return self.get_response(request)

        # Check for token in the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Token '):
            token_key = auth_header.split(' ')[1]
            try:
                token = Token.objects.get(key=token_key)
                request.user = token.user
            except Token.DoesNotExist:
                return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        response = self.get_response(request)
        return response
        