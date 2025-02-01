import pytest
from typing import AnyStr, List, Union

from features.providers.clients.base_provider import BaseProvider

class TestProvider(BaseProvider):
    """Concrete implementation of BaseProvider for testing"""
    def chat(self, model: str, messages: Union[List, AnyStr], stream: bool = False):
        return "Test response"

    def stream(self, model: str, messages: Union[List, AnyStr]):
        yield "Test stream"

    def model(self):
        return "Test model"

    def models(self):
        return ["model1", "model2"]

    def generate(self):
        return "Test generation"

def test_base_provider_abstract_methods():
    """Test that BaseProvider cannot be instantiated without implementing abstract methods"""
    with pytest.raises(TypeError):
        BaseProvider()

def test_concrete_provider_instantiation():
    """Test that a concrete implementation can be instantiated"""
    provider = TestProvider()
    assert isinstance(provider, BaseProvider)

def test_concrete_provider_methods():
    """Test that concrete implementation methods work as expected"""
    provider = TestProvider()
    
    # Test chat method
    response = provider.chat("test-model", [{"role": "user", "content": "Hello"}])
    assert response == "Test response"
    
    # Test stream method
    stream_response = list(provider.stream("test-model", [{"role": "user", "content": "Hello"}]))
    assert stream_response == ["Test stream"]
    
    # Test model method
    assert provider.model() == "Test model"
    
    # Test models method
    assert provider.models() == ["model1", "model2"]
    
    # Test generate method
    assert provider.generate() == "Test generation"