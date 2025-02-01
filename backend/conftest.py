import os
import django
import pytest
from django.conf import settings

# Configure Django settings before running tests
def pytest_configure():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.settings')
    django.setup()

@pytest.fixture(autouse=True)
def mock_settings(monkeypatch):
    """Mock Django settings for tests"""
    monkeypatch.setattr(settings, 'OLLAMA_ENDPOINT', 'http://localhost:11434')
    monkeypatch.setattr(settings, 'OPENAI_API_KEY', 'test-key')

@pytest.fixture
def sample_messages():
    """Sample messages for testing"""
    return [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"},
        {"role": "assistant", "content": "Hi! How can I help you today?"},
        {"role": "user", "content": "What's the weather like?"}
    ]

@pytest.fixture
def sample_image_message():
    """Sample message with image for testing"""
    return {
        "role": "user",
        "content": "What's in this image?",
        "images": ["base64_encoded_image_data"]
    }