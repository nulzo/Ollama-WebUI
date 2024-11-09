from abc import ABC, abstractmethod

class BaseProvider(ABC):
    @abstractmethod
    def chat(content): ...

    @abstractmethod
    def stream(content): ...

    @abstractmethod
    def models(): ...

    @abstractmethod
    def model(model_id): ...

    @abstractmethod
    def generate(content): ...