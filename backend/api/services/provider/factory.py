from typing import Union, AnyStr

from api.services.provider import BaseProvider
from api.services.provider.ollama import OllamaProvider
from api.services.provider.openai import OpenAiProvider

ProviderType = Union["ollama", "openai", AnyStr]


class ProviderFactory:
    @staticmethod
    def get_provider(provider_name: ProviderType) -> BaseProvider:
        if provider_name == "ollama":
            return OllamaProvider()
        elif provider_name == "openai":
            return OpenAiProvider()
        else:
            raise Exception("Provider not found!")
