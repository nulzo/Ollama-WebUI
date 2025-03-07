import json
import logging
import random
import re
from typing import Any, Dict, List, Optional

from api.utils.exceptions.exceptions import ProviderException, ValidationError

logger = logging.getLogger(__name__)


class PromptTemplateService:
    def get_template(self, style: str) -> str:
        """Get the template based on the specified style"""
        style_prompts = {
            "default": """
                {instruction_variant} user-to-AI prompts spanning various intellectual dimensions. {structure_variant}
            """,
            "creative": """
                {instruction_variant} creative prompts for users to ask AI systems about artistic and imaginative topics. {structure_variant}
            """,
            "analytical": """
                {instruction_variant} analytical prompts for users to ask AI systems about STEM and logical reasoning topics. {structure_variant}
            """,
            "inspirational": """
                {instruction_variant} inspirational prompts for users to ask AI systems about personal growth and motivation. {structure_variant}
            """,
            "casual": """
                {instruction_variant} casual prompts for users to have everyday conversations with AI systems. {structure_variant}
            """,
        }
        return style_prompts.get(style.lower(), style_prompts["default"])

class PromptVariantService:
    def get_variants(self) -> Dict[str, List[str]]:
        """Get all available variants for prompt construction"""
        return {
            "instruction_variants": [
                "Generate 5 unique and engaging",
                "Create 5 diverse and interesting",
                "Design 5 thought-provoking and varied",
                "Formulate 5 compelling and distinct",
            ],
            "structure_variants": [
                "Each should be phrased as a question or request that a user would ask an AI assistant.",
                "Format each as a natural query or instruction that a human would pose to an AI system.",
                "Ensure each is written from a user's perspective, asking the AI for information or assistance.",
                "Craft each as a user-initiated prompt that would elicit a helpful AI response.",
            ],
            "optional_instructions": [
                "Make the prompts conversational and natural-sounding, as if coming from a curious human user.",
                "Balance specificity with open-endedness to encourage detailed AI responses.",
                "Include a mix of question types: some seeking information, others requesting creative output or analysis.",
                "Ensure prompts are clear and unambiguous to help the AI provide relevant responses.",
            ],
        }


class PromptBuilderService:
    def build_prompt(self, template: str, variants: Dict[str, str]) -> str:
        """
        Build the complete prompt dialog with formatting instructions
        """
        base_prompt = template.format(**variants)

        formatting_instructions = """
        The title should summarize the topic or intent of the prompt.
        Ensure that each prompt is phrased as a question or request that a human user would ask an AI assistant.
        Maintain strict JSON formatting standards for output validity.
        The title should be descriptive and 3-7 words long.
        For each prompt, also create a "simple_prompt" field with a very concise 2-4 word version of the prompt.
        The simple_prompt should capture the essence of the full prompt in the most concise way possible.
        Respond solely with the JSON output.
        The output should be in the following format:
        {
            "prompts": [
                {"title": "...", "prompt": "...", "simple_prompt": "..."},
                {"title": "...", "prompt": "...", "simple_prompt": "..."},
                {"title": "...", "prompt": "...", "simple_prompt": "..."},
            ]
        }
        """

        if "optional_instructions" in variants:
            formatting_instructions += f"\n{variants['optional_instructions']}"

        return base_prompt + formatting_instructions

class PromptBuilderService:
    def build_prompt(self, template: str, variants: Dict[str, str]) -> str:
        """
        Build the complete prompt dialog with formatting instructions
        """
        base_prompt = template.format(**variants)

        formatting_instructions = """
        The title should always start with a verb (e.g., "Create", "Design", "Imagine", "Explore", etc.) and be a summary of the prompt.
        Ensure that each prompt is phrased in less than 30 words.
        Maintain strict JSON formatting standards for output validity.
        The title should be at least 5 words.
        For each prompt, also create a "simple_prompt" field with a very concise 2-4 word version of the prompt.
        The simple_prompt should capture the essence of the full prompt in the most concise way possible.
        Respond solely with the JSON output.
        The output should be in the following format:
        {
            "prompts": [
                {"title": "...", "prompt": "...", "simple_prompt": "..."},
                {"title": "...", "prompt": "...", "simple_prompt": "..."},
                {"title": "...", "prompt": "...", "simple_prompt": "..."},
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

    def get_actionable_prompts(self, style: str = "", model: str = "llama3.2:3b") -> List[Dict[str, Any]]:
        """
        Get prompts using the template system based on style and provider
        """
        try:
            self.logger.info(f"Getting actionable prompts with style: {style}, model: {model}")
            print(f"DEBUG: PromptService.get_actionable_prompts called with model: {model}")
            
            # Get template based on style
            template = self.template_service.get_template(style)

            # Get all available variants
            all_variants = self.variant_service.get_variants()

            # Select random variants
            chosen_variants = {
                "instruction_variant": random.choice(all_variants["instruction_variants"]),
                "structure_variant": random.choice(all_variants["structure_variants"]),
                "optional_instructions": " ".join(
                    random.sample(all_variants["optional_instructions"], k=2)
                ),
            }

            # Build the complete prompt
            prompt_dialog = self.builder_service.build_prompt(template, chosen_variants)
            self.logger.info(f"Generated prompt dialog: {prompt_dialog}")

            # Format messages for the provider
            messages = [
                {"role": "system", "content": prompt_dialog},
                {"role": "user", "content": "Generate the prompts as specified. Return the result as a JSON object with a 'prompts' array. Each prompt should have 'title', 'prompt', and 'simple_prompt' fields."},
            ]
            
            # Log the message format for debugging
            self.logger.info(f"Message format: {type(messages)}, first item type: {type(messages[0])}")
            self.logger.info(f"Messages being sent to provider: {json.dumps(messages)}")

            # Check if provider is available
            if not self.provider:
                self.logger.error("Provider is not available")
                return self.get_default_prompts(style)

            # Get response from provider using the specified model
            self.logger.info(f"Calling provider with model: {model}")
            try:
                # Ensure we're using the correct model, not the default
                if not model:
                    self.logger.warning("No model specified, using default: llama3.2:3b")
                    model = "llama3.2:3b"
                else:
                    self.logger.info(f"Using specified model: {model}")
                
                # Add more detailed logging
                self.logger.info(f"Provider type: {type(self.provider).__name__}")
                
                # Use the provider directly but with better error handling
                try:
                    # First try to use the generate method which might be more reliable
                    response = self.provider.generate(model=model, prompt=json.dumps(messages))
                    self.logger.info(f"Provider generate response received for model: {model}")
                except Exception as generate_error:
                    self.logger.warning(f"Provider generate failed, falling back to chat: {generate_error}")
                    # Fall back to chat method
                    response = self.provider.chat(model=model, messages=messages)
                    self.logger.info(f"Provider chat response received for model: {model}")
                
                # Check if the response is wrapped in Markdown code blocks
                if response.strip().startswith("```") and "```" in response:
                    self.logger.info("Detected Markdown code block, stripping backticks")
                    # Extract content between code block markers
                    code_block_pattern = r"```(?:json)?\n([\s\S]*?)\n```"
                    matches = re.findall(code_block_pattern, response)
                    if matches:
                        # Use the first code block found
                        response = matches[0].strip()
                        self.logger.info(f"Extracted JSON from code block: {response[:100]}...")
                
                # General cleanup of the response
                # Remove any leading/trailing whitespace
                response = response.strip()
                
                # Remove any non-JSON text before the first opening brace
                first_brace = response.find('{')
                if first_brace > 0:
                    self.logger.info(f"Removing {first_brace} characters before first opening brace")
                    response = response[first_brace:]
                
                # Remove any non-JSON text after the last closing brace
                last_brace = response.rfind('}')
                if last_brace < len(response) - 1:
                    self.logger.info(f"Removing {len(response) - last_brace - 1} characters after last closing brace")
                    response = response[:last_brace + 1]
                
                self.logger.info(f"Cleaned response: {response[:100]}...")
                
                # Try to parse as JSON
                try:
                    # If the response is already a dict, convert it to JSON string
                    if isinstance(response, dict):
                        response = json.dumps(response)
                        
                    # Check if the response is empty
                    if not response or response.strip() == "":
                        self.logger.warning("Empty response from provider, using defaults")
                        return self.get_default_prompts(style)
                        
                    self.logger.info(f"Response type: {type(response)}, length: {len(response)}")
                    self.logger.info(f"Response preview: {response[:100]}...")
                    
                    # Parse the cleaned response
                    prompts_data = json.loads(response)
                    
                    # Check if we have a prompts array
                    if "prompts" in prompts_data and prompts_data["prompts"]:
                        self.logger.info(f"Found {len(prompts_data['prompts'])} prompts in response")
                        return prompts_data["prompts"]
                    else:
                        # Try to create a prompts structure from the response
                        self.logger.warning("No 'prompts' key in response, attempting to create structure")
                        
                        # If it's a dictionary, try to extract prompts
                        if isinstance(prompts_data, dict):
                            # Create a simple prompts array from the dictionary
                            prompts = []
                            for key, value in prompts_data.items():
                                if isinstance(value, str):
                                    prompt = {
                                        "title": key,
                                        "prompt": value,
                                        "simple_prompt": " ".join(value.split()[:3]) + "..."
                                    }
                                    prompts.append(prompt)
                            
                            # If we found prompts, return them
                            if prompts:
                                self.logger.info(f"Created {len(prompts)} prompts from dictionary response")
                                return prompts
                except json.JSONDecodeError as json_error:
                    self.logger.error(f"JSON parsing error: {json_error}")
                    # Continue to text-based extraction
                
                # If JSON parsing failed or no prompts were found, try to extract prompts from text
                self.logger.warning("Attempting to extract prompts from text response")
                
                # Create a simple prompts array
                prompts = []
                lines = response.split("\n")
                current_prompt = {}
                
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    
                    if line.lower().startswith("title:"):
                        if current_prompt and "title" in current_prompt and "prompt" in current_prompt:
                            prompts.append(current_prompt)
                            current_prompt = {}
                        current_prompt["title"] = line[6:].strip()
                    elif line.lower().startswith("prompt:"):
                        current_prompt["prompt"] = line[7:].strip()
                        # Create a simple prompt
                        words = current_prompt["prompt"].split()[:3]
                        current_prompt["simple_prompt"] = " ".join(words) + "..."
                
                # Add the last prompt
                if current_prompt and "title" in current_prompt and "prompt" in current_prompt:
                    prompts.append(current_prompt)
                
                # If we found prompts, return them
                if prompts:
                    self.logger.info(f"Created {len(prompts)} prompts from text response")
                    return prompts
                
                # Try to create prompts from paragraphs as a last resort
                self.logger.warning("Attempting to extract prompts from paragraphs")
                prompts = []
                paragraphs = response.split("\n\n")
                
                for i, paragraph in enumerate(paragraphs):
                    if paragraph.strip():
                        title = f"Prompt {i+1}"
                        prompt_text = paragraph.strip()
                        words = prompt_text.split()[:3]
                        simple_prompt = " ".join(words) + "..." if words else "..."
                        
                        prompts.append({
                            "title": title,
                            "prompt": prompt_text,
                            "simple_prompt": simple_prompt,
                            "style": style
                        })
                
                # If we found prompts, return them
                if prompts:
                    self.logger.info(f"Created {len(prompts)} prompts from paragraphs")
                    return prompts
                
                # If all else fails, use default prompts
                self.logger.warning("Could not create prompts from response, using defaults")
                return self.get_default_prompts(style)
                
            except Exception as e:
                self.logger.error(f"Provider error: {e}")
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
                "simple_prompt": "Mars colony",
                "style": style or "default",
            },
            {
                "title": "Design Future Transportation",
                "prompt": "Conceptualize a revolutionary transportation system that is fast, eco-friendly, and accessible to everyone globally.",
                "simple_prompt": "Green transport",
                "style": style or "default",
            },
            {
                "title": "Advance Artificial Intelligence",
                "prompt": "What ethical considerations should guide the development of artificial general intelligence (AGI) to ensure it benefits humanity?",
                "simple_prompt": "AI ethics",
                "style": style or "default",
            },
        ]
        return default_prompts
