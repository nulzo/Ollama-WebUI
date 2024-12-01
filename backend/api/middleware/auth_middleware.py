from django.http import JsonResponse
from rest_framework import status
from rest_framework.authtoken.models import Token
from asgiref.sync import sync_to_async

class AuthenticationMiddleware:
    EXEMPT_PATHS = {
        '/api/auth/login/',
        '/api/auth/logout/',
        '/api/auth/register/',
    }
    
    def __init__(self, get_response):
        self.get_response = get_response

    async def __call__(self, request):
        # Handle preflight requests
        if request.method == 'OPTIONS':
            response = await self.get_response(request)
            response['Access-Control-Allow-Origin'] = '*'  # Configure appropriately
            return response
            
        # Check if path is exempt
        if request.path in self.EXEMPT_PATHS:
            return await self.get_response(request)
            
        # Validate token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header or not auth_header.startswith('Token '):
            return JsonResponse(
                {'error': 'Authentication required'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        try:
            token_key = auth_header.split(' ')[1]
            token = await sync_to_async(Token.objects.get)(key=token_key)
            request.user = await sync_to_async(getattr)(token, 'user')
        except Token.DoesNotExist:
            return JsonResponse(
                {'error': 'Invalid token'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        return await self.get_response(request)