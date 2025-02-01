import pytest
from features.authentication.serializers.user_serializer import (
    UserCreateSerializer,
    UserResponseSerializer,
    UserUpdateSerializer,
    LoginSerializer
)

@pytest.mark.django_db
class TestUserSerializers:
    def test_user_create_serializer_valid(self, test_user_data):
        serializer = UserCreateSerializer(data=test_user_data)
        assert serializer.is_valid()

    def test_user_create_serializer_invalid(self):
        invalid_data = {
            'username': '',  # Empty username
            'email': 'invalid-email',  # Invalid email
            'password': '123'  # Too short password
        }
        serializer = UserCreateSerializer(data=invalid_data)
        assert not serializer.is_valid()

    def test_user_response_serializer(self, test_user):
        serializer = UserResponseSerializer(test_user)
        data = serializer.data
        
        assert data['username'] == test_user.username
        assert data['email'] == test_user.email
        assert 'password' not in data

    def test_user_update_serializer(self, test_user):
        update_data = {
            'name': 'Updated Name',
            'description': 'New description'
        }
        serializer = UserUpdateSerializer(test_user, data=update_data, partial=True)
        assert serializer.is_valid()

    def test_login_serializer(self):
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        serializer = LoginSerializer(data=login_data)
        assert serializer.is_valid()
