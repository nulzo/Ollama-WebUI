from ollama import Client
from typing import Union, List, Dict, Any
from django.conf import settings


class OllamaService:
    def __init__(self):
        _ollama_host = settings.OLLAMA_HOST
        _ollama_port = settings.OLLAMA_PORT
        self._client = Client(host=f"{_ollama_host}:{_ollama_port}")

    def create_message_context(self, role: str, messages: Union[List, str]):
        return [{"role": role, "content": messages}]

    def chat(self, model: str, messages: Dict[Any, Any]):
        return self._client.chat(model=model, messages=messages, stream=True)

    def get_all_models(self):
        return self._client.list()
    
    def get_actionable_prompts(self) -> List[Dict[str, str]]:
        """
        Returns a list of predefined actionable prompts with titles.
        """
        prompt = """Generate 5 random actionable prompts exploring a wide range of topics. Each prompt should have a title and a corresponding question or instruction. The output should be in the following JSON format:
            {
                "prompts": [
                    {
                        "title": "Create a love song",
                        "prompt": "Please create a love song for me. Provide the chords and the lyrics."
                    },
                    ...
                ]
            }
        Ensure the prompts are diverse, engaging, and cover various subjects.
        Ensure that the JSON output is valid.
        Be very creative with the prompts. They should be fun and engaging, while providing novelty.
        Ensure that the prompts are less than 20 words each.
        Ensure that the prompts are concise and to the point.
        ONLY reply with the JSON output.
        """

        response = self._client.chat(model="llama3.2:3b", messages=[{"role": "user", "content": prompt}], format="json")
        # Parse the JSON response
        import json
        try:
            prompts = json.loads(response['message']['content'])
            return prompts
        except Exception as e:
            # Fallback to default prompts if parsing fails
            return [
                {
                    "title": "Explore Space Colonization",
                    "prompt": "What are the main challenges and potential solutions for establishing a self-sustaining human colony on Mars?"
                },
                {
                    "title": "Reinvent Education",
                    "prompt": "Propose an innovative education system that addresses the shortcomings of traditional schooling and prepares students for the challenges of the 22nd century."
                },
                {
                    "title": "Solve Global Hunger",
                    "prompt": "Develop a comprehensive plan to eliminate world hunger using sustainable agriculture, technology, and policy changes."
                },
                {
                    "title": "Design Future Transportation",
                    "prompt": "Conceptualize a revolutionary transportation system that is fast, eco-friendly, and accessible to everyone globally."
                },
                {
                    "title": "Advance Artificial Intelligence",
                    "prompt": "What ethical considerations should guide the development of artificial general intelligence (AGI) to ensure it benefits humanity?"
                }
            ]


ollama_service = OllamaService()
