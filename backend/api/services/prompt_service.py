import json
import random
from typing import List, Dict, Optional, Any
import logging
from api.utils.exceptions.exceptions import ProviderException, ValidationError

logger = logging.getLogger(__name__)


class PromptTemplateService:
    def get_template(self, style: str) -> str:
        """Get the template based on the specified style"""
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


class PromptVariantService:
    def get_variants(self) -> Dict[str, List[str]]:
        """Get all available variants for prompt construction"""
        return {
            "instruction_variants": [
                "Generate 5 unique and imaginative",
                "Create 5 diverse and engaging",
                "Design 5 thought-provoking and varied",
                "Formulate 5 inventive and distinct",
            ],
            "structure_variants": [
                "Each should provide an intriguing question or engaging task.",
                "Ensure each includes a stimulating question or activity.",
                "Include a captivating question or clear task for each.",
                "Each should pose a curiosity-sparking question or directive.",
            ],
            "optional_instructions": [
                "Ensure originality and coherence in each title and prompt.",
                "Balance between creativity and clarity in each prompt.",
                "Incorporate elements of surprise and intellectual challenge.",
                "Develop prompts that are both thought-provoking and accessible.",
            ]
        }


class PromptBuilderService:
    def build_prompt(self, template: str, variants: Dict[str, str]) -> str:
        """
        Build the complete prompt dialog with formatting instructions
        """
        base_prompt = template.format(**variants)
        
        formatting_instructions = """
        The title should always start with a verb (e.g., "Create", "Design", "Imagine", "Explore", etc.) and be a summary of the prompt.
        Ensure that each prompt is phrased in less than 100 words.
        Maintain strict JSON formatting standards for output validity.
        The title should be at least 5 words.
        Respond solely with the JSON output.
        The output should be in the following format:
        {
            "prompts": [
                {"title": "...", "prompt": "..."},
                {"title": "...", "prompt": "..."},
                {"title": "...", "prompt": "..."},
            ]
        }
        """
        
        if "optional_instructions" in variants:
            formatting_instructions += f"\n{variants['optional_instructions']}"
            
        return base_prompt + formatting_instructions

class PromptService:
    def __init__(
        self,
        template_service: PromptTemplateService,
        variant_service: PromptVariantService,
        builder_service: PromptBuilderService,
        provider: Optional[Any] = None,
    ):
        self.template_service = template_service
        self.variant_service = variant_service
        self.builder_service = builder_service
        self.provider = provider
        self.logger = logging.getLogger(__name__)

    def get_actionable_prompts(self, style: str = "") -> List[Dict[str, Any]]:
        """
        Get prompts using the template system based on style and provider
        """
        try:
            # Get template based on style
            template = self.template_service.get_template(style)

            # Get all available variants
            all_variants = self.variant_service.get_variants()

            # Select random variants
            chosen_variants = {
                "instruction_variant": random.choice(all_variants["instruction_variants"]),
                "structure_variant": random.choice(all_variants["structure_variants"]),
                "optional_instructions": " ".join(random.sample(all_variants["optional_instructions"], k=2))
            }

            # Build the complete prompt
            prompt_dialog = self.builder_service.build_prompt(template, chosen_variants)
            self.logger.info(f"Generated prompt dialog: {prompt_dialog}")

            # Format messages for the provider
            messages = [
                {"role": "system", "content": prompt_dialog},
                {"role": "user", "content": "Generate the prompts as specified."}
            ]

            # Get response from provider
            response = self.provider.chat(model="llama3.2:3b", messages=messages)

            try:
                # Parse the JSON response
                self.logger.info(f"Provider response: {response}")
                prompts = json.loads(response)
                self.logger.info(f"Parsed prompts: {prompts}")
                return prompts.get("prompts", self.get_default_prompts(style))
            except (json.JSONDecodeError, KeyError) as e:
                self.logger.error(f"Failed to parse provider response: {e}")
                return self.get_default_prompts(style)

        except ProviderException as e:
            self.logger.error(f"Provider error: {e}", exc_info=True)
            return self.get_default_prompts(style)
        except ValidationError as e:
            self.logger.error(f"Validation error: {e}", exc_info=True)
            raise
        except Exception as e:
            self.logger.error(f"Error generating prompts: {str(e)}")
            return self.get_default_prompts(style)

    def get_default_prompts(self, style: str = "") -> List[Dict[str, str]]:
        """
        Get default prompts with style information
        """
        default_prompts = [
            {
                "title": "Explore Space Colonization",
                "prompt": "What are the main challenges and potential solutions for establishing a self-sustaining human colony on Mars?",
                "style": style or "default",
            },
            {
                "title": "Reinvent Education",
                "prompt": "Propose an innovative education system that addresses the shortcomings of traditional schooling and prepares students for the challenges of the 22nd century.",
                "style": style or "default",
            },
            {
                "title": "Solve Global Hunger",
                "prompt": "Develop a comprehensive plan to eliminate world hunger using sustainable agriculture, technology, and policy changes.",
                "style": style or "default",
            },
            {
                "title": "Design Future Transportation",
                "prompt": "Conceptualize a revolutionary transportation system that is fast, eco-friendly, and accessible to everyone globally.",
                "style": style or "default",
            },
            {
                "title": "Advance Artificial Intelligence",
                "prompt": "What ethical considerations should guide the development of artificial general intelligence (AGI) to ensure it benefits humanity?",
                "style": style or "default",
            },
        ]
        return default_prompts
    