import json
import random
from typing import List, Dict
import logging
from api.providers.ollama_provider import OllamaProvider

logger = logging.getLogger(__name__)


class PromptService:
    def __init__(self):
        self.ollama_provider = OllamaProvider()
        self.logger = logger

    def get_prompt_template(self, style: str = "") -> str:
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
        return style_prompts.get(style.lower(), style_prompts["default"])

    def get_actionable_prompts(self, style: str = "") -> List[Dict[str, str]]:
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

        optional_instructions = [
            "Ensure originality and coherence in each title and prompt.",
            "Balance between creativity and clarity in each prompt.",
            "Incorporate elements of surprise and intellectual challenge.",
            "Develop prompts that are both thought-provoking and accessible.",
        ]

        prompt_template = self.get_prompt_template(style)
        chosen_instruction_variant = random.choice(instruction_variants)
        chosen_structure_variant = random.choice(prompt_structure_variants)
        chosen_optional_instructions = random.sample(optional_instructions, k=2)

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

        prompt = (
            prompt_template.format(
                instruction_variant=chosen_instruction_variant,
                structure_variant=chosen_structure_variant,
            )
            + prompt_dialog
        )

        try:
            self.logger.info("TRYING PROMPT")
            response = self.ollama_provider.slow_chat(
                model="llama3.2:3b",
                messages=[{"role": "user", "content": prompt}],
            )

            self.logger.info(f"Generated prompts: {response}")

            return response["prompts"]

        except Exception as e:
            self.logger.error(f"Error generating prompts: {str(e)}")
            return self.get_default_prompts()

    def get_default_prompts(self) -> List[Dict[str, str]]:
        self.logger.info("Generating default prompts")
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
