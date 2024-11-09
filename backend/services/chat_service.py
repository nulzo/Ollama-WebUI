# psuedocode writeup for chat service class

class ChatService:
    def __init__(self) -> None:
        self.repository = ...
        self.provider_factory = ...

    def chat(self, provider: str):
        # Get the provider based off the provider type given to the request
        provider = self.provider_factory
        chat_response = provider
        # Save the responses to the satbase throught the respoitoey service
        saved = self.repository
        # return the response back to the controller
        return chat_response