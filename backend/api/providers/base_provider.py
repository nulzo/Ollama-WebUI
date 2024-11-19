from abc import ABC, abstractmethod
from typing import AsyncGenerator, Union, List, AnyStr


class BaseProvider(ABC):
    def __init__(self) -> None:
        pass

    @abstractmethod
    def chat(self, model: str, messages: Union[List, AnyStr]): ...

    @abstractmethod
    def stream(self, model: str, messages: Union[List, AnyStr]): ...

    @abstractmethod
    def model(self): ...

    @abstractmethod
    def models(self): ...

    @abstractmethod
    def generate(self): ...
