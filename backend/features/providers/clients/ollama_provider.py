import json
import logging
from timeit import default_timer as timer
from typing import AnyStr, Dict, List, Union, Generator
import time

from ollama import Client as OllamaClient

from features.analytics.services.analytics_service import AnalyticsEventService
from features.providers.clients.base_provider import BaseProvider
from api.utils.exceptions.exceptions import ServiceError
from features.tools.models import Tool
from features.tools.services.tool_service import ToolService

logger = logging.getLogger(__name__)


def normalize_endpoint(endpoint: str) -> str:
    """
    Ensures the endpoint has a proper URL scheme.
    """
    if not endpoint.startswith(("http://", "https://")):
        return f"http://{endpoint}"
    return endpoint

class OllamaProvider(BaseProvider):
    def __init__(self, config: dict) -> None:
        print(f"Initializing OllamaProvider with config: {config}")
        if not isinstance(config, dict):
            raise ValueError("Expected config to be a dict.")
        endpoint = config.get("endpoint")
        if not endpoint:
            raise ValueError("Endpoint is required in the config for OllamaProvider.")
        # Normalize the endpoint directly.
        endpoint = normalize_endpoint(endpoint)
        # Pull in is_enabled; default to False if not specified.
        self.is_enabled = config.get("is_enabled", False)
        # Create and store our configuration directly as a dictionary.
        self.config = {
            "endpoint": endpoint,
            "is_enabled": self.is_enabled,
            "api_key": config.get("api_key"),
            "organization_id": config.get("organization_id"),
        }
        self._client = OllamaClient(host=endpoint)
        self._cancel_event = None
        self.logger = logger
        self.tool_service = ToolService()
        # Add caching for models
        self._models_cache = None
        self._models_cache_time = 0
        self._models_cache_ttl = 300  # 5 minutes
        super().__init__(analytics_service=AnalyticsEventService())

    def update_config(self, config: Dict) -> None:
        """
        Update the Ollama provider configuration.

        For example, if the endpoint or is_enabled flag has changed.
        """
        # Update endpoint if provided and changed.
        if "endpoint" in config:
            new_endpoint = normalize_endpoint(config["endpoint"])
            if new_endpoint != self.config["endpoint"]:
                self.config["endpoint"] = new_endpoint
                self._client = OllamaClient(host=new_endpoint)
                self.logger.info(
                    f"Updated Ollama client with new endpoint: {new_endpoint}"
                )
        # Update the is_enabled flag if provided.
        if "is_enabled" in config and config["is_enabled"] != self.is_enabled:
            self.is_enabled = config["is_enabled"]
            self.config["is_enabled"] = config["is_enabled"]

    def chat(
        self,
        model: str,
        messages: Union[List[Dict], AnyStr],
        stream: bool = False,
        **kwargs
    ) -> Union[str, Generator[str, None, None]]:
        """
        Send a chat request to Ollama.
        If stream is True, this returns a generator that streams responses.
        Otherwise, it returns the complete response as a string.
        """
        try:
            if stream:
                return self.stream(model, messages, **kwargs)
            else:
                return self.generate(model, messages, **kwargs)
        except Exception as e:
            self.logger.error(f"Error in Ollama chat: {str(e)}")
            raise ServiceError(f"Ollama chat failed: {str(e)}")

    def _flatten_messages(self, messages: Union[List[Dict], AnyStr]) -> List[Dict]:
        """
        Flatten the messages into a list of dictionaries.
        """
        if isinstance(messages, str):
            return [{"role": "user", "content": messages}]
        return messages
    
    def stream(
        self,
        model: str,
        messages: Union[List[Dict], AnyStr],
        **kwargs
    ) -> Generator[str, None, None]:
        """
        Stream a response from the Ollama service.
        Yields JSON strings with a "content" key populated from the response.
        """
        # For simplicity, use a simple flag for cancellation.
        self._cancel_event = False  
        start_time = timer()
        token_usage = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}

        processed_messages = self._flatten_messages(messages)
        
        # Check if function calling is enabled for this request
        enable_function_calling = kwargs.get("function_call", False)
        user_id = kwargs.get("user_id")
        tools = []
        
        # If function calling is enabled, get the available tools
        if enable_function_calling and user_id:
            try:
                # Get enabled tools for the user
                user_tools = self.tool_service.get_user_tools(user_id)
                enabled_tools = [tool for tool in user_tools if tool.is_enabled]
                
                # Convert tools to Ollama format
                if enabled_tools:
                    tools = self.tool_service.prepare_tools_for_ollama(enabled_tools)
                    self.logger.info(f"Using {len(tools)} tools for function calling")
            except Exception as e:
                self.logger.error(f"Error preparing tools: {str(e)}")

        try:
            # Call the Ollama client in streaming mode with tools if available
            options = {}
            if tools:
                options["tools"] = tools
                self.logger.info(f"Sending tools to Ollama: {json.dumps(tools)}")
                print(f"DEBUG: Sending tools to Ollama: {json.dumps(tools)}")
                
            self.logger.info(f"Calling Ollama with model: {model}, stream: True, options: {options}")
            print(f"DEBUG: Calling Ollama with model: {model}, stream: True, options: {options}")
                
            response_stream = self._client.chat(
                model=model, 
                messages=processed_messages, 
                stream=True,
                options=options
            )

            for chunk in response_stream:
                # Log the raw chunk for debugging
                print(f"DEBUG: Raw chunk from Ollama: {json.dumps(chunk, default=str)}")
                self.logger.debug(f"Raw chunk from Ollama: {json.dumps(chunk, default=str)}")
                
                # More detailed logging about the chunk content
                if "message" in chunk:
                    if "tool_calls" in chunk.get("message", {}):
                        print(f"DEBUG: Tool calls in message: {json.dumps(chunk['message']['tool_calls'])}")
                        self.logger.info(f"Tool calls in message: {json.dumps(chunk['message']['tool_calls'])}")
                
                # Check for tool calls in the response
                if "tool_calls" in chunk:
                    tool_calls = chunk.get("tool_calls", [])
                    self.logger.info(f"Received tool calls: {tool_calls}")
                    print(f"DEBUG: Processing tool calls: {json.dumps(tool_calls)}")
                    
                    # Process tool calls
                    if user_id and tool_calls:
                        try:
                            # Get the user
                            from features.authentication.models import CustomUser
                            user = CustomUser.objects.get(id=user_id)
                            
                            # Execute the tool calls
                            tool_results = self.tool_service.handle_tool_call(tool_calls, user)
                            
                            # Yield the tool call results
                            yield json.dumps({
                                "tool_calls": tool_calls,
                                "tool_results": tool_results,
                                "status": "tool_call"
                            })
                            
                            # Add the tool results to the messages for context
                            for result in tool_results:
                                processed_messages.append({
                                    "role": "tool",
                                    "tool_call_id": result.get("tool_call_id"),
                                    "name": result.get("name"),
                                    "content": str(result.get("result", result.get("error", "")))
                                })
                            
                            # Continue the conversation with the tool results
                            continue_response = self._client.chat(
                                model=model,
                                messages=processed_messages,
                                stream=True,
                                options=options
                            )
                            
                            # Stream the continued response
                            for continue_chunk in continue_response:
                                if continue_chunk.get("done"):
                                    # Update token usage from the final chunk
                                    token_usage["prompt_tokens"] += continue_chunk.get("prompt_eval_count", 0)
                                    token_usage["completion_tokens"] += continue_chunk.get("eval_count", 0)
                                else:
                                    # Extract the text
                                    text = ""
                                    if "message" in continue_chunk:
                                        text = continue_chunk.get("message", {}).get("content", "")
                                    else:
                                        text = continue_chunk.get("content", "")
                                        
                                    if text.strip():
                                        yield json.dumps({"content": text, "status": "generating"})
                            
                        except Exception as tool_error:
                            self.logger.error(f"Error processing tool calls: {str(tool_error)}")
                            yield json.dumps({"error": str(tool_error), "status": "error"})
                
                elif chunk.get("done"):
                    # Update token usage from the final chunk.
                    token_usage["prompt_tokens"] = chunk.get("prompt_eval_count", 0)
                    token_usage["completion_tokens"] = chunk.get("eval_count", 0)
                    
                    event_data = self._prepare_analytics_event(token_usage, model, start_time, kwargs.get("user_id"))
                    self.log_chat_completion(event_data)
                    
                    yield json.dumps({"status": "done", "usage": token_usage})
                else:
                    # Try extracting the actual text.
                    text = ""
                    if "message" in chunk:
                        # If the chunk wraps the text under a "message" key
                        text = chunk.get("message", {}).get("content", "")
                    else:
                        # Fall back to "content" if available
                        text = chunk.get("content", "")
                        
                    if not text.strip():
                        continue  # Skip empty strings
                    
                    yield json.dumps({"content": text, "status": "generating"})
        except Exception as e:
            generation_time = timer() - start_time
            self.logger.error(f"Error in streaming generation: {str(e)}")
            event_data = self._prepare_analytics_event(
                token_usage, model, start_time, kwargs.get("user_id"), error=str(e)
            )
            self.log_chat_completion(event_data)
            yield json.dumps({"error": str(e), "status": "error"})

    def generate(
        self,
        model: str,
        messages: Union[List[Dict], AnyStr],
        **kwargs
    ) -> str:
        """
        Generate a non-streaming response from Ollama.
        """
        processed_messages = self._flatten_messages(messages)

        # Add debug logging to verify the model being used
        self.logger.info(f"Calling Ollama generate with model: {model}")
        print(f"DEBUG: Calling Ollama generate with model: {model}")
        
        # Ensure model parameter is passed correctly
        response = self._client.chat(model=model, messages=processed_messages, stream=False)
        
        # Log the response for debugging
        self.logger.debug(f"Ollama response: {response}")
        
        # Assume the response is a dict with a "message" key.
        if isinstance(response, dict) and "message" in response:
            return response["message"]["content"]
        return str(response)

    def models(self) -> List[str]:
        """
        Return a list of available models from Ollama if the configuration is enabled.
        Each model returned is a dict containing:
        - id: model identifier
        - name: model name
        - model: display name of the model
        - max_input_tokens: maximum allowed input tokens (default: 2048)
        - max_output_tokens: maximum allowed output tokens (default: 2048)
        - vision_enabled: whether the model supports vision (default: False)
        - embedding_enabled: whether the model supports embeddings (default: False)
        - tools_enabled: whether the model supports tools (default: False)
        - provider: "ollama"
        """
        if not self.is_enabled:
            self.logger.info("Ollama provider is not enabled; skipping model loading.")
            return []
            
        # Check cache first
        current_time = time.time()
        if self._models_cache is not None and current_time - self._models_cache_time < self._models_cache_ttl:
            self.logger.info("Using cached Ollama models")
            return self._models_cache
            
        try:
            model_list = self._client.list()
            models = []
            
            for model in model_list.get("models", []):
                model_name = model.get("name")
                # Dynamically check if the model supports tools
                tools_enabled = self.supports_tools(model_name)
                
                models.append({
                    "id": f"{model_name}-{model.get('digest')}",
                    "name": model_name,
                    "model": model.get("model"),
                    "max_input_tokens": 2048,
                    "max_output_tokens": 2048,
                    "vision_enabled": False,
                    "embedding_enabled": False,
                    "tools_enabled": tools_enabled,
                    "provider": "ollama",
                })
            
            # Update cache
            self._models_cache = models
            self._models_cache_time = current_time
            
            return models
        except Exception as e:
            self.logger.error(f"Error fetching models: {str(e)}")
            return []

    def calculate_cost(self, tokens: Dict[str, int], model: str) -> float:
        """
        Calculate the cost for a request.
        For Ollama (running locally) cost is 0.
        """
        return 0.0
    
    
    def _prepare_analytics_event(
        self,
        token_usage: Dict[str, int],
        model: str,
        start_time: float,
        user_id: any,
        error: str = None
    ) -> Dict:
        """
        Build the analytics event data.
        Updates total token count, calculates generation time,
        and adds error information if provided.
        """
        # Calculate total tokens and generation time.
        token_usage["total_tokens"] = token_usage["prompt_tokens"] + token_usage["completion_tokens"]
        generation_time = timer() - start_time

        event_type = "error" if error else "chat_completion"
        event_data = {
            "user_id": user_id,
            "event_type": event_type,
            "model": model,
            "tokens": token_usage["total_tokens"],
            "prompt_tokens": token_usage["prompt_tokens"],
            "completion_tokens": token_usage["completion_tokens"],
            "cost": self.calculate_cost(token_usage, model),
            "metadata": {"generation_time": generation_time},
        }
        if error:
            event_data["metadata"]["error"] = error
        return event_data

    def supports_tools(self, model: str) -> bool:
        """
        Check if the specified model supports function calling/tools.
        
        Args:
            model: The model name to check
            
        Returns:
            bool: True if the model supports function calling, False otherwise
        """
        try:
            # Query Ollama for model information
            model_info = self._client.show(model=model)
            
            # Check if the model metadata indicates function calling support
            # Look for specific tags or model families known to support tools
            if "metadata" in model_info:
                metadata = model_info.get("metadata", {})
                
                # Check for explicit function calling capability flag
                if metadata.get("function_calling") is True:
                    return True
                
                # Check model family from template
                template = metadata.get("template", "").lower()
                if any(family in template for family in ["llama3", "mistral", "mixtral", "gemma", "claude"]):
                    return True
                
                # Check model family from system info
                system_prompt = metadata.get("system", "").lower()
                if any(family in system_prompt for family in ["llama3", "mistral", "mixtral", "gemma", "claude"]):
                    return True
                
                # Check model architecture
                architecture = metadata.get("architecture", "").lower()
                if any(arch in architecture for arch in ["llama3", "mistral", "mixtral", "gemma", "claude"]):
                    return True
            
            # If we can't determine from metadata, try to check the model name
            return self._check_model_supports_tools(model)
            
        except Exception as e:
            self.logger.warning(f"Error checking model capabilities for {model}: {str(e)}")
            # Fall back to checking the model name
            return self._check_model_supports_tools(model)
    
    def _check_model_supports_tools(self, model: str) -> bool:
        """
        Check if a model supports function calling based on its name.
        This is a fallback method when we can't determine from metadata.
        
        Args:
            model: The model name to check
            
        Returns:
            bool: True if the model name indicates function calling support
        """
        # List of models known to support function calling
        function_calling_models = [
            "llama3", "llama3:8b", "llama3:70b",  # Llama 3 models
            "mistral", "mixtral",  # Mistral models
            "gemma", "gemma:7b", "gemma:2b",  # Gemma models
            "claude", "claude-3",  # Claude models
        ]
        
        # Check if the model name contains any of the function calling models
        return any(model_name in model.lower() for model_name in function_calling_models)