import pytest
from rest_framework.test import APIClient
from features.authentication.models import CustomUser

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user_data():
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
        "name": "Test User",
        "first_name": "Test",
        "last_name": "User"
    }

@pytest.fixture
def test_user(db, test_user_data):
    user = CustomUser.objects.create_user(
        username=test_user_data["username"],
        email=test_user_data["email"],
        password=test_user_data["password"],
        name=test_user_data["name"]
    )
    return user

@pytest.fixture(autouse=True)
def mock_settings(settings):
    """Mock Django settings for tests"""
    settings.OLLAMA_ENDPOINT = 'http://localhost:11434'
    settings.OPENAI_API_KEY = 'test-key'