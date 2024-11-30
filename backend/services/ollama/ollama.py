import random
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

    def get_actionable_prompts(self, style: str = "") -> List[Dict[str, str]]:
        """
        Returns a list of predefined actionable prompts with titles.
        """
        # Define possible instruction and structure variations
        instruction_variants = [
            "Generate 5 unique and imaginative",
            "Create 5 diverse and engaging",
            "Design 5 thought-provoking and varied",
            "Formulate 5 inventive and distinct",
        ]

        prompt_structure_variants = [
            "Each should provide an intriguing question or engaging task.",
            "Ensure each includes a stimulating question or activity.",
            "Include a captivating question or clear task for each.",
            "Each should pose a curiosity-sparking question or directive.",
        ]

        # Optional instructions to inject into the prompt
        optional_instructions = [
            "Ensure originality and coherence in each title and prompt.",
            "Balance between creativity and clarity in each prompt.",
            "Incorporate elements of surprise and intellectual challenge.",
            "Develop prompts that are both thought-provoking and accessible.",
        ]

        style_prompts = {
            "default": """
                {instruction_variant} actionable prompts spanning various intellectual dimensions. {structure_variant}
            """,
            "creative": """
                {instruction_variant} creative conversation starters that spark innovative artistic thinking. {structure_variant}
            """,
            "analytical": """
                {instruction_variant} analytical conversation initiators emphasizing STEM topics. {structure_variant}
            """,
            "inspirational": """
                {instruction_variant} inspirational prompts that drive personal growth and positivity. {structure_variant}
            """,
            "casual": """
                {instruction_variant} casual conversation starters ideal for everyday discussions. {structure_variant}
            """,
        }

        # Choose random instructions to ensure diversity
        chosen_instruction_variant = random.choice(instruction_variants)
        chosen_structure_variant = random.choice(prompt_structure_variants)
        chosen_optional_instructions = random.sample(
            optional_instructions, k=2
        )  # choose 2 optional instructions

        prompt_dialog = f"""
        The title should always start with a verb (e.g., "Create", "Design", "Imagine", "Explore", etc.) and be a summary of the prompt.
        Ensure that each prompt is phrased in less than 100 words.
        Maintain strict JSON formatting standards for output validity.
        The title should be at least 5 words.
        Respond solely with the JSON output.
        The output should be in the following format:
        {{
            "prompts": [
                {{"title": "...", "prompt": "..."}},
                {{"title": "...", "prompt": "..."}},
                {{"title": "...", "prompt": "..."}},
            ]
        }}
        {' '.join(chosen_optional_instructions)}
        """

        prompt_template = style_prompts.get(style.lower(), style_prompts["default"])
        prompt = (
            prompt_template.format(
                instruction_variant=chosen_instruction_variant,
                structure_variant=chosen_structure_variant,
            )
            + prompt_dialog
        )

        response = self._client.chat(
            model="llama3.2:3b", messages=[{"role": "user", "content": prompt}], format="json"
        )

        try:
            return json.loads(response["message"]["content"])
        except Exception:
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
