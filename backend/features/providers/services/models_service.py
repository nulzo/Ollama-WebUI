import logging
from typing import Dict, List, Optional, Any, TypeVar, Union
import uuid
import threading
import json
import requests
import time
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

from features.providers.clients.provider_factory import provider_factory
from api.utils.exceptions import ServiceError

logger = logging.getLogger(__name__)

# Dictionary to store download tasks and their status
download_tasks = {}

class DownloadTask:
    def __init__(self, model_name, user_id):
        self.id = uuid.uuid4()
        self.model_name = model_name
        self.user_id = user_id
        self.status = "pending"
        self.progress = 0
        self.total_size = 0
        self.downloaded = 0
        self.error = None
        self.start_time = time.time()
        self.end_time = None

class ModelsService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        # Cache for models to avoid repeated API calls
        self._models_cache = {}
        self._cache_timestamp = {}
        self._cache_ttl = 300  # 5 minutes cache TTL

    def get_provider_models(self, user_id: int, provider_type: str = None) -> Dict[str, List[str]]:
        """
        Get available models for specified provider(s).

        Args:
            user_id: The ID of the user requesting models.
            provider_type: Optional provider type to filter results. When not provided,
                           the models for all supported providers will be returned.

        Returns:
            Dict mapping each provider name to its available models.
        """
        try:
            # If a specific provider type is provided, limit to that provider; otherwise, query all.
            if provider_type:
                providers = [provider_type]
            else:
                providers = ["ollama", "openai", "google", "anthropic", "openrouter"]
            
            # Check cache first
            current_time = time.time()
            models = {}
            providers_to_fetch = []
            
            for provider_name in providers:
                cache_key = f"{provider_name}_{user_id}"
                if (cache_key in self._models_cache and 
                    current_time - self._cache_timestamp.get(cache_key, 0) < self._cache_ttl):
                    # Use cached models if available and not expired
                    self.logger.info(f"Using cached models for {provider_name}")
                    models[provider_name] = self._models_cache[cache_key]
                else:
                    # Need to fetch this provider
                    providers_to_fetch.append(provider_name)
            
            # Fetch models for providers not in cache
            if providers_to_fetch:
                self.logger.info(f"Fetching models for providers: {providers_to_fetch}")
                
                # Use ThreadPoolExecutor to fetch models in parallel
                with ThreadPoolExecutor(max_workers=len(providers_to_fetch)) as executor:
                    future_to_provider = {
                        executor.submit(self._fetch_provider_models, provider_name, user_id): provider_name
                        for provider_name in providers_to_fetch
                    }
                    
                    for future in as_completed(future_to_provider):
                        provider_name = future_to_provider[future]
                        try:
                            provider_models = future.result()
                            models[provider_name] = provider_models
                            
                            # Update cache
                            cache_key = f"{provider_name}_{user_id}"
                            self._models_cache[cache_key] = provider_models
                            self._cache_timestamp[cache_key] = current_time
                        except Exception as e:
                            self.logger.warning(f"Failed to fetch models for {provider_name}: {str(e)}")
                            models[provider_name] = []
            
            return models

        except Exception as e:
            self.logger.error(f"Error fetching provider models: {str(e)}")
            raise ServiceError(f"Failed to fetch provider models: {str(e)}")
    
    def _fetch_provider_models(self, provider_name: str, user_id: int) -> List[Dict]:
        """Helper method to fetch models for a specific provider"""
        try:
            provider = provider_factory.get_provider(provider_name, user_id)
            return provider.models()
        except Exception as e:
            self.logger.warning(f"Failed to fetch models for {provider_name}: {str(e)}")
            return []
    
    def download_model(self, model_name: str, user_id: int) -> DownloadTask:
        """
        Download a model from Ollama.
        
        Args:
            model_name: Name of the model to download
            user_id: ID of the user requesting the download
            
        Returns:
            DownloadTask object with task ID and initial status
        """
        try:
            self.logger.info(f"Starting download for model: {model_name}, user: {user_id}")
            
            # Check if model name is valid
            if not model_name or not isinstance(model_name, str):
                raise ValueError("Invalid model name")
                
            # Create a new download task
            task = DownloadTask(model_name, user_id)
            task_id = str(task.id)
            download_tasks[task_id] = task
            
            self.logger.info(f"Created download task with ID: {task_id}")
            
            # Start download in a separate thread
            thread = threading.Thread(
                target=self._download_model_thread,
                args=(task,)
            )
            thread.daemon = True
            thread.start()
            
            return task
        except Exception as e:
            self.logger.error(f"Error starting model download: {str(e)}")
            raise ServiceError(f"Failed to start model download: {str(e)}")
    
    def _download_model_thread(self, task: DownloadTask):
        """
        Thread function to handle model download.
        
        Args:
            task: DownloadTask object containing download information
        """
        try:
            self.logger.info(f"Starting download thread for model {task.model_name} with task ID {task.id}")
            
            # Update task status
            task.status = "pulling manifest"
            
            # Get Ollama API URL from environment or use default
            ollama_host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
            api_url = f"{ollama_host}/api/pull"
            
            self.logger.info(f"Sending pull request to Ollama API at {api_url} for model {task.model_name}")
            
            # Start streaming the download
            with requests.post(
                api_url, 
                json={"name": task.model_name},
                stream=True,
                timeout=60  # Add timeout to prevent hanging
            ) as response:
                if response.status_code != 200:
                    error_msg = f"Ollama API returned status code {response.status_code}: {response.text}"
                    self.logger.error(error_msg)
                    task.status = "failed"
                    task.error = error_msg
                    task.end_time = time.time()
                    return
                
                self.logger.info(f"Ollama API responded with status code {response.status_code}, processing stream")
                
                # Process the streaming response
                for line in response.iter_lines():
                    if not line:
                        continue
                    
                    try:
                        data = json.loads(line)
                        self.logger.debug(f"Received data from Ollama API: {data}")
                        
                        # Update status based on the response
                        if "status" in data:
                            task.status = data["status"]
                            self.logger.info(f"Updated task status to: {task.status}")
                        
                        # Update progress information
                        if "completed" in data and "total" in data and data["total"] > 0:
                            task.progress = int((data["completed"] / data["total"]) * 100)
                            task.downloaded = data["completed"]
                            task.total_size = data["total"]
                            self.logger.debug(f"Updated progress: {task.progress}%, {task.downloaded}/{task.total_size}")
                        
                        # Check for download completion
                        if data.get("status") == "success":
                            task.status = "success"
                            task.progress = 100
                            if task.total_size > 0:
                                task.downloaded = task.total_size
                            self.logger.info(f"Download completed successfully for model {task.model_name}")
                            break
                            
                        # Check for errors
                        if "error" in data:
                            task.status = "failed"
                            task.error = data["error"]
                            self.logger.error(f"Download failed with error: {data['error']}")
                            break
                            
                    except json.JSONDecodeError:
                        self.logger.warning(f"Could not parse JSON from Ollama API: {line}")
                        continue
            
            # Final status update
            if task.status != "failed" and task.status != "success":
                task.status = "success"
                task.progress = 100
                self.logger.info(f"Setting final status to success for model {task.model_name}")
            
            task.end_time = time.time()
            self.logger.info(f"Download thread completed for model {task.model_name}, status: {task.status}")
                
        except Exception as e:
            self.logger.error(f"Error in download thread: {str(e)}")
            task.status = "failed"
            task.error = str(e)
            task.end_time = time.time()
    
    def get_download_status(self, task_id: str) -> Dict:
        """
        Get the status of a model download task.
        
        Args:
            task_id: ID of the download task
            
        Returns:
            Dictionary with task status information
        """
        try:
            self.logger.debug(f"Getting download status for task ID: {task_id}")
            
            if task_id not in download_tasks:
                self.logger.warning(f"Download task not found: {task_id}")
                return {
                    "id": task_id,
                    "model": "unknown",
                    "status": "not_found",
                    "progress": 0,
                    "total_size": 0,
                    "downloaded": 0,
                    "error": "Download task not found",
                    "elapsed_seconds": 0
                }
            
            task = download_tasks[task_id]
            
            # Calculate elapsed time
            elapsed = 0
            if task.end_time:
                elapsed = task.end_time - task.start_time
            else:
                elapsed = time.time() - task.start_time
                
            self.logger.debug(f"Task status: {task.status}, progress: {task.progress}%")
            
            return {
                "id": str(task.id),
                "model": task.model_name,
                "status": task.status,
                "progress": task.progress,
                "total_size": task.total_size,
                "downloaded": task.downloaded,
                "error": task.error,
                "elapsed_seconds": int(elapsed)
            }
        except Exception as e:
            self.logger.error(f"Error getting download status: {str(e)}")
            return {
                "id": task_id,
                "model": "unknown",
                "status": "error",
                "progress": 0,
                "total_size": 0,
                "downloaded": 0,
                "error": str(e),
                "elapsed_seconds": 0
            }
        
    def get_available_models(self) -> List[Dict]:
        """
        Get available models from Ollama library.
        
        Returns:
            List of available models with metadata
        """
        try:
            # Fetch models from the ollama-models endpoint
            self.logger.info("Fetching available models from ollama-models.zwz.workers.dev")
            response = requests.get("https://ollama-models.zwz.workers.dev/models")
            
            if response.status_code != 200:
                self.logger.error(f"Failed to fetch models: HTTP {response.status_code}")
                # Fall back to mock data if the API call fails
                return self._get_mock_models()
            
            models_data = response.json()
            
            # Transform the data to match our expected format
            transformed_models = []
            for model in models_data:
                # Extract capabilities from tags
                capabilities = []
                parameter_tags = []
                if "tags" in model:
                    for tag in model["tags"]:
                        if tag in ["vision", "chat", "code", "tools"]:
                            capabilities.append(tag)
                        # Extract parameter sizes and quantization info from tags
                        elif any(tag.startswith(prefix) for prefix in ["1.5b", "7b", "8b", "13b", "14b", "32b", "70b", "671b"]):
                            parameter_tags.append(tag)
                
                # Extract sizes from model variants and tags
                sizes = []
                if "variants" in model:
                    for variant in model["variants"]:
                        if "parameters" in variant:
                            param_size = variant["parameters"]
                            # Convert to format like "7b", "13b", etc.
                            if param_size >= 1_000_000_000:
                                size_str = f"{param_size // 1_000_000_000}b"
                                if size_str not in sizes:
                                    sizes.append(size_str)
                
                # Add sizes from parameter tags if not already included
                for tag in parameter_tags:
                    # Extract the base size (e.g., "7b" from "7b-qwen-distill-fp16")
                    parts = tag.split('-')
                    base_size = parts[0]
                    
                    # Add the full tag as a size option
                    if tag not in sizes:
                        sizes.append(tag)
                    
                    # Also add the base size if not already included
                    if base_size not in sizes and base_size.endswith('b'):
                        sizes.append(base_size)
                
                # Ensure we have at least one capability and size
                if not capabilities:
                    capabilities = ["chat"]  # Default capability
                
                if not sizes:
                    sizes = ["unknown"]  # Default size
                
                # Add size estimates based on parameter count
                size_estimates = {}
                for size in sizes:
                    # Extract the base size for estimation
                    base_size = size.split('-')[0] if '-' in size else size
                    
                    # Rough estimates based on parameter count and quantization
                    if base_size.endswith("b"):
                        try:
                            # Extract the number part (e.g., "7" from "7b")
                            param_count = float(base_size[:-1])
                            
                            # Adjust size based on quantization
                            quantization_factor = 1.0
                            if "-q4_" in size:
                                quantization_factor = 0.25  # 4-bit quantization
                            elif "-q8_" in size:
                                quantization_factor = 0.5   # 8-bit quantization
                            elif "-fp16" in size:
                                quantization_factor = 0.5   # 16-bit precision
                            
                            # Estimate size based on parameter count
                            # These are very rough estimates and should be adjusted based on real data
                            if param_count <= 3:
                                size_estimates[size] = int(param_count * 1_000_000_000 * 2 * quantization_factor)  # ~2GB per billion params
                            elif param_count <= 7:
                                size_estimates[size] = int(param_count * 1_000_000_000 * 2.5 * quantization_factor)  # ~2.5GB per billion params
                            elif param_count <= 13:
                                size_estimates[size] = int(param_count * 1_000_000_000 * 3 * quantization_factor)  # ~3GB per billion params
                            else:
                                size_estimates[size] = int(param_count * 1_000_000_000 * 4 * quantization_factor)  # ~4GB per billion params
                        except ValueError:
                            # If we can't parse the size, use a default estimate
                            size_estimates[size] = 5_000_000_000  # 5GB default
                
                transformed_model = {
                    "name": model.get("name", ""),
                    "description": model.get("description", ""),
                    "capabilities": capabilities,
                    "sizes": sizes,
                    "published": model.get("updated_at", ""),
                    "link": f"https://ollama.com/library/{model.get('name', '')}",
                    "pulls": model.get("downloads", "0"),
                    "size_estimates": size_estimates
                }
                
                transformed_models.append(transformed_model)
            
            return transformed_models
            
        except Exception as e:
            self.logger.error(f"Error in get_available_models: {str(e)}")
            # Fall back to mock data if there's an exception
            return self._get_mock_models()
    
    def _get_mock_models(self) -> List[Dict]:
        """
        Provide mock model data as a fallback.
        
        Returns:
            List of mock model data
        """
        self.logger.info("Using mock available models data")
        return [
            {
                "name": "llama3",
                "description": "Meta Llama 3: The most capable openly available LLM to date",
                "capabilities": ["chat", "vision"],
                "sizes": ["8b", "70b"],
                "published": "2024-05-21T16:54:02Z",
                "link": "https://ollama.com/library/llama3",
                "pulls": "6.7M"
            },
            {
                "name": "mistral",
                "description": "The 7B model released by Mistral AI, updated to version 0.3.",
                "capabilities": ["tools", "chat"],
                "sizes": ["7b"],
                "published": "2024-08-19T16:54:02Z",
                "link": "https://ollama.com/library/mistral",
                "pulls": "5.4M"
            },
            {
                "name": "gemma",
                "description": "Gemma is a family of lightweight, state-of-the-art open models built by Google DeepMind. Updated to version 1.1",
                "capabilities": ["chat"],
                "sizes": ["2b", "7b"],
                "published": "2024-04-21T16:54:02Z",
                "link": "https://ollama.com/library/gemma",
                "pulls": "4.2M"
            },
            {
                "name": "phi3",
                "description": "Microsoft's Phi-3 models are state-of-the-art small language models",
                "capabilities": ["chat"],
                "sizes": ["3.8b", "14b"],
                "published": "2024-04-15T10:30:00Z",
                "link": "https://ollama.com/library/phi3",
                "pulls": "3.1M"
            },
            {
                "name": "codellama",
                "description": "A large language model that can use text and code prompts to generate and discuss code",
                "capabilities": ["code", "chat"],
                "sizes": ["7b", "13b", "34b"],
                "published": "2024-02-10T14:30:00Z",
                "link": "https://ollama.com/library/codellama",
                "pulls": "2.8M"
            },
            {
                "name": "llava",
                "description": "Multimodal model combining LLaMA with visual capabilities",
                "capabilities": ["vision", "chat"],
                "sizes": ["7b", "13b"],
                "published": "2024-01-15T09:45:00Z",
                "link": "https://ollama.com/library/llava",
                "pulls": "2.5M"
            },
            {
                "name": "falcon",
                "description": "Falcon is a state-of-the-art language model optimized for efficient deployment",
                "capabilities": ["chat"],
                "sizes": ["7b", "40b"],
                "published": "2023-12-05T11:20:00Z",
                "link": "https://ollama.com/library/falcon",
                "pulls": "2.2M"
            },
            {
                "name": "vicuna",
                "description": "Vicuna is a chat assistant trained by fine-tuning LLaMA on user-shared conversations",
                "capabilities": ["chat"],
                "sizes": ["7b", "13b"],
                "published": "2023-11-20T08:15:00Z",
                "link": "https://ollama.com/library/vicuna",
                "pulls": "2.0M"
            },
            {
                "name": "orca-mini",
                "description": "Orca Mini is a 7B parameter model fine-tuned on explanation data",
                "capabilities": ["chat"],
                "sizes": ["3b", "7b"],
                "published": "2023-10-10T15:40:00Z",
                "link": "https://ollama.com/library/orca-mini",
                "pulls": "1.8M"
            },
            {
                "name": "stablelm",
                "description": "StableLM is a language model optimized for stability and performance",
                "capabilities": ["chat"],
                "sizes": ["7b"],
                "published": "2023-09-25T13:10:00Z",
                "link": "https://ollama.com/library/stablelm",
                "pulls": "1.5M"
            },
            {
                "name": "wizardcoder",
                "description": "A code generation model fine-tuned from CodeLlama",
                "capabilities": ["code"],
                "sizes": ["7b", "13b", "34b"],
                "published": "2023-09-05T10:30:00Z",
                "link": "https://ollama.com/library/wizardcoder",
                "pulls": "1.3M"
            },
            {
                "name": "neural-chat",
                "description": "A fine-tuned model optimized for dialogue and instruction following",
                "capabilities": ["chat"],
                "sizes": ["7b"],
                "published": "2023-08-15T14:20:00Z",
                "link": "https://ollama.com/library/neural-chat",
                "pulls": "1.1M"
            }
        ]
            
    def delete_model(self, provider_type: str, model_name: str, user_id: int) -> bool:
        """
        Delete a model from a provider.
        
        Args:
            provider_type: Type of provider (e.g., 'ollama')
            model_name: Name of the model to delete
            user_id: ID of the user requesting the deletion
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # Currently only Ollama is supported for model deletion
            if provider_type != "ollama":
                raise ServiceError(f"Model deletion not supported for provider: {provider_type}")
                
            # Get Ollama API URL from environment or use default
            ollama_host = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
            api_url = f"{ollama_host}/api/delete"
            
            # Send delete request to Ollama API
            self.logger.info(f"Deleting model {model_name} via Ollama API")
            response = requests.delete(api_url, json={"name": model_name})
            
            if response.status_code != 200:
                error_msg = f"Ollama API returned status code {response.status_code}"
                self.logger.error(error_msg)
                raise ServiceError(error_msg)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error in delete_model for {model_name}: {str(e)}")
            raise ServiceError(f"Failed to delete model {model_name}: {str(e)}")