import json
import random
from typing import List, Dict, Optional, Any
import logging

logger = logging.getLogger(__name__)


class PromptService:
    def __init__(self, provider: Optional[Any] = None):
        self.provider = provider
        self.logger = logging.getLogger(__name__)

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

    async def get_actionable_prompts(self, style: str = "") -> List[Dict[str, Any]]:
        """
        Get prompts using the template system based on style and provider
        """
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

        # Get the template based on style and potentially provider
        prompt_template = self.get_prompt_template(style)
        
        # Choose random variants
        chosen_instruction_variant = random.choice(instruction_variants)
        chosen_structure_variant = random.choice(prompt_structure_variants)
        chosen_optional_instructions = random.sample(optional_instructions, k=2)

        # Build the prompt with provider-specific adjustments if needed
        prompt_dialog = self._build_prompt_dialog(
            chosen_instruction_variant,
            chosen_structure_variant,
            chosen_optional_instructions,
            style
        )
        
        self.logger.info(f"Prompt dialog: {prompt_dialog}")
        try:
            response = await self.provider.chat(prompt_dialog)
            
            try:
                # Parse the JSON response
                prompts = json.loads(response)
                return [
                    {
                        "title": p["title"],
                        "prompt": p["prompt"],
                        "style": style or "default"
                    }
                    for p in prompts[:5]  # Ensure we only return 5 prompts
                ]
            except (json.JSONDecodeError, KeyError) as e:
                self.logger.error(f"Failed to parse provider response: {e}")
                return self.get_default_prompts(style)



        except Exception as e:
            self.logger.error(f"Error generating prompts: {str(e)}")
            return self.get_default_prompts(style)
        
    def _get_openai_prompts(self, prompt_dialog: str) -> List[Dict[str, str]]:
        """
        Get OpenAI-specific prompts using the prompt dialog
        """
        try:
            provider = self.provider_factory.get_provider('openai', self.user_id)
            messages = [
                {"role": "system", "content": prompt_dialog},
                {"role": "user", "content": "Generate the prompts as specified."}
            ]
            
            response = ""
            for chunk in provider.chat("gpt-3.5-turbo", messages):
                response += chunk
            
            try:
                # Parse the JSON response
                data = json.loads(response)
                return data.get("prompts", self.get_default_prompts())
            except json.JSONDecodeError as e:
                self.logger.error(f"Failed to parse OpenAI response: {e}")
                return self.get_default_prompts()
                
        except Exception as e:
            self.logger.error(f"Error getting OpenAI prompts: {e}")
            return self.get_default_prompts()

    def _get_ollama_prompts(self, prompt_dialog: str) -> List[Dict[str, str]]:
        """
        Get Ollama-specific prompts using the prompt dialog
        """
        try:
            provider = self.provider_factory.get_provider('ollama', self.user_id)
            messages = [
                {"role": "system", "content": prompt_dialog},
                {"role": "user", "content": "Generate the prompts as specified."}
            ]
            
            response = ""
            for chunk in provider.chat("llama2", messages):
                response += chunk
            
            try:
                # Parse the JSON response
                data = json.loads(response)
                return data.get("prompts", self.get_default_prompts())
            except json.JSONDecodeError as e:
                self.logger.error(f"Failed to parse Ollama response: {e}")
                return self.get_default_prompts()
                
        except Exception as e:
            self.logger.error(f"Error getting Ollama prompts: {e}")
            return self.get_default_prompts()

    def _build_prompt_dialog(
        self,
        instruction_variant: str,
        structure_variant: str,
        optional_instructions: List[str],
        style: str
    ) -> str:
        """
        Build the complete prompt dialog with formatting instructions
        """
        prompt_template = self.get_prompt_template(style)
        
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
        {' '.join(optional_instructions)}
        """

        return (
            prompt_template.format(
                instruction_variant=instruction_variant,
                structure_variant=structure_variant,
            )
            + prompt_dialog
        )

    def _get_generic_prompts(self, prompt_dialog: str) -> List[Dict[str, str]]:
        """
        Get generic prompts using the prompt dialog
        """
        # TODO: Implement generic prompt generation
        return self.get_default_prompts()

    def get_default_prompts(self, style: str = "") -> List[Dict[str, str]]:
        """
        Get default prompts with style information
        """
        default_prompts = [
            {
                "title": "Explore Space Colonization",
                "prompt": "What are the main challenges and potential solutions for establishing a self-sustaining human colony on Mars?",
                "style": style or "default"
            },
            {
                "title": "Reinvent Education",
                "prompt": "Propose an innovative education system that addresses the shortcomings of traditional schooling and prepares students for the challenges of the 22nd century.",
                "style": style or "default"
            },
            {
                "title": "Solve Global Hunger",
                "prompt": "Develop a comprehensive plan to eliminate world hunger using sustainable agriculture, technology, and policy changes.",
                "style": style or "default"
            },
            {
                "title": "Design Future Transportation",
                "prompt": "Conceptualize a revolutionary transportation system that is fast, eco-friendly, and accessible to everyone globally.",
                "style": style or "default"
            },
            {
                "title": "Advance Artificial Intelligence",
                "prompt": "What ethical considerations should guide the development of artificial general intelligence (AGI) to ensure it benefits humanity?",
                "style": style or "default"
            },
        ]
        return default_prompts