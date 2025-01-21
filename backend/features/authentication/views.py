from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login, logout, authenticate
from rest_framework.parsers import MultiPartParser, FormParser

from api.utils.responses.response import api_response
from features.authentication.serializers.user_serializer import UserCreateSerializer, UserResponseSerializer, \
    LoginSerializer, UserUpdateSerializer
from features.authentication.services.user_service import UserService
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from rest_framework.views import APIView


@method_decorator(csrf_exempt, name='dispatch')
class AuthViewSet(viewsets.ViewSet):
    """
    ViewSet for handling authentication operations.
    """

    def get_permissions(self):
        if self.action in ['register', 'login']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Create a new user account"""
        serializer = UserCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                error={"code": "VALIDATION_ERROR", "message": "Invalid data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_service = UserService()
            user = user_service.create_user(serializer.validated_data)
            token, _ = Token.objects.get_or_create(user=user)
            response_data = {
                "token": token.key,
                "user": UserResponseSerializer(user).data
            }
            return api_response(data=response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return api_response(
                error={"code": "REGISTRATION_ERROR", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login user and return token"""
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                error={"code": "VALIDATION_ERROR", "message": "Invalid credentials"},
                status=status.HTTP_400_BAD_REQUEST
            )

        print(serializer.validated_data)
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )

        if not user:
            return api_response(
                error={"code": "INVALID_CREDENTIALS", "message": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        login(request, user)

        token, _ = Token.objects.get_or_create(user=user)

        print(token)
        print(token.key)

        response_data = {
            "token": token.key,
            "user": UserResponseSerializer(user).data
        }

        print("Login Response Data:", response_data)

        return api_response(data=response_data)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Logout user and delete token"""
        try:
            request.user.auth_token.delete()
            logout(request)
            return api_response(data={"message": "Successfully logged out"})
        except Exception as e:
            return api_response(
                error={"code": "LOGOUT_ERROR", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserViewSet(viewsets.ViewSet):
    """
    ViewSet for managing user profile operations.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current user profile"""
        serializer = UserResponseSerializer(request.user)
        return api_response(data=serializer.data)

    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        """Update current user profile"""
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(
                error={"code": "VALIDATION_ERROR", "message": "Invalid data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user_service = UserService()
            updated_user = user_service.update_user(request.user.id, serializer.validated_data)
            response_serializer = UserResponseSerializer(updated_user)
            return api_response(data=response_serializer.data)
        except Exception as e:
            return api_response(
                error={"code": "UPDATE_ERROR", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['delete'])
    def delete_account(self, request):
        """Delete current user account"""
        try:
            user_service = UserService()
            user_service.delete_user(request.user.id)
            logout(request)
            return api_response(data={"message": "Account successfully deleted"})
        except Exception as e:
            return api_response(
                error={"code": "DELETE_ERROR", "message": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


User = get_user_model()


class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.serializer_class(data=request.data, context={"request": request})
            if serializer.is_valid():
                user = serializer.validated_data["user"]
                token, created = Token.objects.get_or_create(user=user)
                return Response({"token": token.key, "user_id": user.pk, "email": user.email})
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)


class RegisterView(APIView):
    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(username=username, email=email, password=password)
        token, created = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "user_id": user.pk, "email": user.email},
            status=status.HTTP_201_CREATED,
        )