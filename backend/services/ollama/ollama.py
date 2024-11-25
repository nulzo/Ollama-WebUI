from ollama import Client
from typing import Union, List, Dict, Any
from django.conf import settings
import json


class OllamaService:
    def __init__(self):
        _ollama_host = settings.OLLAMA_HOST
        _ollama_port = settings.OLLAMA_PORT
        print(f"Ollama host: {_ollama_host}")
        print(f"Ollama port: {_ollama_port}")
        self._client = Client(host=f"{_ollama_host}:{_ollama_port}")

    def create_message_context(self, role: str, messages: Union[List, str]):
        return [{"role": role, "content": messages}]

    def chat(self, model: str, messages: Dict[Any, Any]):
        return self._client.chat(model=model, messages=messages, stream=True)

    def get_all_models(self):
        return self._client.list()

    def get_model(self, model_name: str):
        """
        Get details for a specific model
        """

        try:
            return self._client.show(model_name)
        except Exception as e:
            print(f"Error fetching model details: {e}")
            return None

    def get_actionable_prompts(self, style: str = '') -> List[Dict[str, str]]:
        """
        Returns a list of predefined actionable prompts with titles.
        """
        style_prompts = {
            "default": """
                Generate 5 unique and imaginative actionable prompts spanning a wide range of creative and intellectual topics. Each prompt should have an engaging title and a clear, concise question or instruction.

                The responses should be in the following JSON format:
                {
                    "prompts": [
                        {
                            "title": "Explore Future Innovations",
                            "prompt": "What groundbreaking technologies might emerge in the next decade?"
                        },
                        ...
                    ]
                }
            """,
            "creative": """
                Generate 5 creative and imaginative conversation starters that encourage innovative thinking and artistic expression.

                The responses should be in the following JSON format:
                {
                    "prompts": [
                        {
                            "title": "Invent a Novel Concept",
                            "prompt": "Can you invent a new form of artistic expression and describe it?"
                        },
                        ...
                    ]
                }
            """,
            "analytical": """
                Generate 5 analytical conversation starters focused on STEM, which emphasize logical analysis, problem-solving, and critical thinking. Focus on topics like mathematics, computer science, physics, and engineering, while also focusing on programming.

                The responses should be in the following JSON format:
                {
                    "prompts": [
                        {
                            "title": "How to Optimize a Sort Algorithm",
                            "prompt": "How would you optimize the performance of a sort algorithm with large datasets?"
                        },
                        ...
                    ]
                }
            """,
            "inspirational": """
                Generate 5 inspirational conversation starters that motivate, encourage personal growth, and positive thinking.

                The responses should be in the following JSON format:
                {
                    "prompts": [
                        {
                            "title": "Encourage Positive Change",
                            "prompt": "What are some small daily habits that can lead to significant personal growth over time?"
                        },
                        ...
                    ]
                }
            """,
            "casual": """
                Generate 5 casual and friendly conversation starters that are relaxed, informal, and suitable for everyday chat.

                The responses should be in the following JSON format:
                {
                    "prompts": [
                        {
                            "title": "Discuss Popular Trends",
                            "prompt": "What are currently trending topics in social media and why do they resonate with people?"
                        },
                        ...
                    ]
                }
            """
        }


        prompt_dialog = """\n\n
        The title should always start with a verb (i.e. "Create", "Design", "Imagine", "Explore", etc.) and be a summary of the prompt.
        Ensure that each prompt is phrased in less than 100 words.
        Maintain strict JSON formatting standards for output validity.
        The title should be at least 5 words.
        Respond solely with the JSON output.
        """

        prompt = style_prompts.get(style.lower(), style_prompts["default"]) + prompt_dialog

        response = self._client.chat(
            model="llama3.2:3b",
            messages=[{"role": "user", "content": prompt}],
            format="json"
        )
        try:
            prompts = json.loads(response["message"]["content"])
            return prompts
        except Exception as e:
            # Fallback to default prompts if parsing fails
            return [
                {
                    "title": "Explore Space Colonization",
                    "prompt": "What are the main challenges and potential solutions for establishing a self-sustaining human colony on Mars?",
                },
                {
                    "title": "Reinvent Education",
                    "prompt": "Propose an innovative education system that addresses the shortcomings of traditional schooling and prepares students for the challenges of the 22nd century.",
                },
                {
                    "title": "Solve Global Hunger",
                    "prompt": "Develop a comprehensive plan to eliminate world hunger using sustainable agriculture, technology, and policy changes.",
                },
                {
                    "title": "Design Future Transportation",
                    "prompt": "Conceptualize a revolutionary transportation system that is fast, eco-friendly, and accessible to everyone globally.",
                },
                {
                    "title": "Advance Artificial Intelligence",
                    "prompt": "What ethical considerations should guide the development of artificial general intelligence (AGI) to ensure it benefits humanity?",
                },
            ]


ollama_service = OllamaService()
