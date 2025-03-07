import asyncio
import json
import logging
from typing import Dict, Generator, List, Union, AsyncGenerator

from google import genai  # from the google-genai package
# Optionally, you can import types if needed
# from google.genai import types

from features.analytics.services.analytics_service import AnalyticsEventService
from features.providers.clients.base_provider import BaseProvider
from api.utils.exceptions.exceptions import ServiceError

logger = logging.getLogger(__name__)

class GoogleProvider(BaseProvider):
    def __init__(self, config: dict) -> None:
        print(f"Initializing GoogleAiProvider with config: {config}")
        if not isinstance(config, dict):
            raise ValueError("Expected config to be a dict.")
        
        # Retrieve is_enabled flag; if enabled, ensure an API key is provided.
        self.is_enabled = config.get("is_enabled", False)
        api_key = config.get("api_key")
        if self.is_enabled and not api_key:
            raise ValueError("API key is required for GoogleAiProvider when enabled.")
        
        # Store configuration for later use.
        self.config = config.copy()
        
        try:
            # Initialize the Gemini API client using the google-genai SDK.
            # Here we use the synchronous client; for streaming we'll use self._client.aio below.
            self._client = genai.Client(api_key=api_key, http_options={'api_version': 'v1alpha'})
            logger.info("Google AI client initialized successfully.")
            print("Google AI client initialized successfully.", self._client.models.list()[0])
        except Exception as e:
            raise ServiceError(f"Failed to initialize Google AI client: {e}")
        
        self.logger = logger
        super().__init__(analytics_service=AnalyticsEventService())
    
    def models(self) -> List[str]:
        """
        Return a list of available Google AI (Gemini) models.
        Each model returned is a dict containing:
        - id: model identifier
        - name: model name
        - model: display name of the model
        - max_input_tokens: maximum allowed input tokens (default: 2048)
        - max_output_tokens: maximum allowed output tokens (default: 2048)
        - vision_enabled: whether the model supports vision (default: False)
        - embedding_enabled: whether the model supports embeddings (default: False)
        - tools_enabled: whether the model supports tools (default: False)
        - provider: "google"
        """
        if not self.is_enabled:
            logger.info("Google AI provider is not enabled; skipping model retrieval.")
            return []
        try:
            models = list(self._client.models.list())
            return [
                {
                    "id": f"{model.name}-google",
                    "name": model.display_name,
                    "model": model.name,
                    "max_input_tokens": model.input_token_limit,
                    "max_output_tokens": model.output_token_limit,
                    "vision_enabled": False,
                    "embedding_enabled": "embedContent" in model.supported_actions,
                    "tools_enabled": "generateContent" in model.supported_actions,
                    "provider": "google",
                }
                for model in models
            ]
        except Exception as e:
            logger.error(f"Error retrieving models: {e}")
            raise ServiceError(f"Failed to retrieve models: {e}")
    
    def _format_model_name(self, model: str) -> str:
        """
        Format the model name for Google API.
        Removes provider suffix and 'models/' prefix if present.
        """
        # Remove provider suffix if present
        if model.endswith("-google"):
            model = model[:-7]  # Remove "-google"
        
        # Remove "models/" prefix if present
        if model.startswith("models/"):
            model = model[7:]  # Remove "models/"
            
        self.logger.info(f"Formatted model name for Google API: {model}")
        return model
        
    def chat(self, model: str, messages: Union[List[Dict], List[str], str]) -> str:
        """
        Generate a response using the Google Gen AI (Gemini) API.
        Handles both string prompts and structured message lists.
        """
        if not self.is_enabled:
            raise ValueError("Google AI Provider is not enabled.")
        
        try:
            # Format the model name
            formatted_model = self._format_model_name(model)
            
            # Handle different message formats
            if isinstance(messages, list):
                if messages and isinstance(messages[0], dict):
                    # Check if this is a prompt generation request
                    is_prompt_generation = any(
                        msg.get("content", "").lower().find("generate prompts") >= 0 
                        for msg in messages
                    )
                    
                    # Convert structured messages to a format Gemini understands
                    prompt = ""
                    for msg in messages:
                        role = msg.get("role", "user")
                        content = msg.get("content", "")
                        if role == "system":
                            prompt += f"System: {content}\n\n"
                        elif role == "user":
                            prompt += f"User: {content}\n\n"
                        elif role == "assistant":
                            prompt += f"Assistant: {content}\n\n"
                        else:
                            prompt += f"{content}\n\n"
                else:
                    # Simple list of strings
                    prompt = "\n".join(messages)
                    is_prompt_generation = prompt.lower().find("generate prompts") >= 0
            else:
                # Single string prompt
                prompt = messages
                is_prompt_generation = prompt.lower().find("generate prompts") >= 0
            
            self.logger.info(f"Sending prompt to Google AI with model {formatted_model}: {prompt[:100]}...")
            
            # If this is a prompt generation request, add specific instructions
            if is_prompt_generation:
                prompt += "\n\nIMPORTANT: Format your response as a valid JSON object with a 'prompts' array. Each prompt in the array should have 'title', 'prompt', and 'simple_prompt' fields."
            
            response = self._client.models.generate_content(
                model=formatted_model,
                contents=prompt
            )
            
            text_response = response.text
            
            # If this is a prompt generation request, ensure the response is valid JSON
            if is_prompt_generation:
                try:
                    # Try to parse as JSON first
                    json.loads(text_response)
                    return text_response
                except json.JSONDecodeError:
                    # If not valid JSON, convert the text response to the expected JSON format
                    self.logger.info("Converting text response to JSON format")
                    
                    # Extract potential prompts from the text
                    lines = text_response.split('\n')
                    prompts = []
                    current_prompt = {}
                    
                    for line in lines:
                        line = line.strip()
                        if not line:
                            continue
                            
                        # Look for patterns like "Title: Something" or "Prompt: Something"
                        if line.lower().startswith("title:"):
                            # If we have a previous prompt, add it to the list
                            if current_prompt and 'title' in current_prompt and 'prompt' in current_prompt:
                                prompts.append(current_prompt)
                                current_prompt = {}
                            current_prompt['title'] = line[6:].strip()
                        elif line.lower().startswith("prompt:"):
                            current_prompt['prompt'] = line[7:].strip()
                            # Create a simple prompt from the first few words
                            words = current_prompt['prompt'].split()[:3]
                            current_prompt['simple_prompt'] = " ".join(words) + "..."
                    
                    # Add the last prompt if it exists
                    if current_prompt and 'title' in current_prompt and 'prompt' in current_prompt:
                        prompts.append(current_prompt)
                    
                    # If we couldn't extract structured prompts, create some from the text
                    if not prompts:
                        # Split the text into chunks and create prompts
                        chunks = text_response.split('\n\n')
                        for i, chunk in enumerate(chunks):
                            if chunk.strip():
                                title = f"Prompt {i+1}"
                                prompt_text = chunk.strip()
                                words = prompt_text.split()[:3]
                                simple_prompt = " ".join(words) + "..."
                                prompts.append({
                                    'title': title,
                                    'prompt': prompt_text,
                                    'simple_prompt': simple_prompt
                                })
                    
                    # Ensure we have at least one prompt
                    if not prompts:
                        prompts = [{
                            'title': 'Default Prompt',
                            'prompt': text_response,
                            'simple_prompt': 'Default prompt...'
                        }]
                    
                    # Create the JSON response
                    json_response = json.dumps({'prompts': prompts})
                    return json_response
            
            return text_response
        except Exception as e:
            self.logger.error(f"Error generating content with Google AI: {e}")
            raise ServiceError(f"Failed to generate content: {e}")
    
    def update_config(self, config: Dict) -> None:
        """
        Update the provider's configuration.
        Supports updating the API key and the is_enabled flag.
        """
        new_api_key = config.get("api_key", self.config.get("api_key"))
        if new_api_key != self.config.get("api_key"):
            self.config["api_key"] = new_api_key
            try:
                self._client = genai.Client(api_key=new_api_key, http_options={'api_version': 'v1alpha'})
                logger.info("Updated Google AI client's API key.")
            except Exception as e:
                logger.error(f"Error updating API key: {e}")
                raise ServiceError(f"Failed to update API key: {e}")
        
        if "is_enabled" in config:
            self.is_enabled = config["is_enabled"]

    def calculate_cost():
        return 0.0
    
    def generate(self, model: str, prompt: str) -> str:
        """
        Generate a response from the Google AI API without streaming.
        This is a convenience wrapper around chat().
        """
        return self.chat(model, prompt)
    
    def supports_tools(self, model: str) -> bool:
        """
        Check if the specified model supports function calling/tools.
        
        Args:
            model: The model name to check
            
        Returns:
            bool: True if the model supports function calling, False otherwise
        """
        try:
            # Get model information from Google AI API
            models = list(self._client.models.list())
            for m in models:
                if m.name == model:
                    # Check if the model has function calling capability
                    return "generateContent" in m.supported_actions and "tools" in getattr(m, "supported_features", [])
            
            # If model not found or no capability info, check known models
            function_calling_models = ["gemini-1.5-pro", "gemini-1.5-flash"]
            return any(model.startswith(m) for m in function_calling_models)
            
        except Exception as e:
            self.logger.warning(f"Error checking model capabilities for {model}: {str(e)}")
            # Fall back to checking known models
            function_calling_models = ["gemini-1.5-pro", "gemini-1.5-flash"]
            return any(model.startswith(m) for m in function_calling_models)
    
    def chat_stream(
        self, model: str, messages: Union[List[Union[str, Dict]], str]
    ) -> Generator[str, None, None]:
        """
        Generate a streaming text response using the synchronous client.
        This method uses the synchronous streaming method (generate_content_stream)
        from the Google Gen AI SDK and yields JSON-formatted chunks.
        """
        if not self.is_enabled:
            raise ValueError("Google AI Provider is not enabled.")

        try:
            # Format the model name
            formatted_model = self._format_model_name(model)
            
            # Handle different message formats
            if isinstance(messages, list):
                if messages and isinstance(messages[0], dict):
                    # Convert structured messages to a format Gemini understands
                    prompt = ""
                    for msg in messages:
                        role = msg.get("role", "user")
                        content = msg.get("content", "")
                        if role == "system":
                            prompt += f"System: {content}\n\n"
                        elif role == "user":
                            prompt += f"User: {content}\n\n"
                        elif role == "assistant":
                            prompt += f"Assistant: {content}\n\n"
                        else:
                            prompt += f"{content}\n\n"
                else:
                    # Simple list of strings
                    prompt = "\n".join(messages)
            else:
                # Single string prompt
                prompt = messages
            
            self.logger.info(f"Streaming prompt to Google AI with model {formatted_model}: {prompt[:100]}...")

            # Use the synchronous streaming method per the SDK docs.
            stream_iter = self._client.models.generate_content_stream(
                model=formatted_model,
                contents=prompt
            )
            for resp in stream_iter:
                # Skip empty responses
                if not resp.text or resp.text.strip() == "":
                    continue
                # Wrap the text in a JSON object so that json.loads(chunk) works downstream.
                chunk_data = {
                    "content": resp.text,
                    "status": "generating"
                }
                yield json.dumps(chunk_data)
        except Exception as e:
            logger.error(f"Error streaming content with Google AI: {e}")
            raise ServiceError(f"Streaming generation failed: {e}")

    def stream(
        self,
        model: str,
        messages: Union[List[Union[str, Dict]], str],
        **kwargs
    ) -> Generator[str, None, None]:
        """
        Synchronous wrapper that simply calls chat_stream.
        Extra kwargs (e.g. user_id, conversation_id) are ignored.
        """
        return self.chat_stream(model, messages)