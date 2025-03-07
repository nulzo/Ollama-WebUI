import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { AvailableModel, ModelDownloadStatus } from '@/features/models/types/models';

// Start a model download
export const downloadModel = async (modelName: string): Promise<{ task_id: string }> => {
  try {
    console.log(`Starting download for model: ${modelName}`);
    
    const response = await api.post<ApiResponse<{ task_id: string }>>('/models/download/', {
      model: modelName,
    });
    
    if (!response.success) {
      console.error('Download API error:', response.error);
      throw new Error(response.error?.message || 'Failed to start model download');
    }
    
    console.log('Download API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error starting model download:', error);
    // For testing purposes, return a mock task ID
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      console.warn('Using mock task ID for development');
      return { task_id: `mock-${Date.now()}-${modelName}` };
    }
    throw error;
  }
};

// Get the status of a model download
export const getDownloadStatus = async (taskId: string): Promise<ModelDownloadStatus> => {
  try {
    // If it's a mock task ID (for development/testing)
    if (taskId.startsWith('mock-')) {
      const modelName = taskId.split('-')[2] || 'unknown';
      const mockProgress = Math.min(100, parseInt(taskId.split('-')[1]) % 100 + 1);
      
      // Simulate download progress
      return {
        id: taskId,
        model: modelName,
        status: mockProgress < 100 ? 'downloading' : 'success',
        progress: mockProgress,
        total_size: 1000000000, // 1GB
        downloaded: mockProgress * 10000000, // Progress percentage of 1GB
        error: null,
        elapsed_seconds: 30
      };
    }
    
    console.log(`Getting download status for task: ${taskId}`);
    // Make sure we're using the correct HTTP method (GET) and endpoint format
    // Add trailing slash to match backend URL pattern
    const endpoint = `/models/download/${taskId}/`;
    console.log(`Making GET request to endpoint: ${endpoint}`);
    
    const response = await api.get<ApiResponse<ModelDownloadStatus>>(endpoint);
    
    if (!response.success) {
      console.error('Download status API error:', response.error);
      throw new Error(response.error?.message || 'Failed to get download status');
    }
    
    console.log('Download status API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting download status:', error);
    throw error;
  }
};

// Get available models from Ollama library
export const getAvailableModels = async (): Promise<AvailableModel[]> => {
  try {
    console.log('Fetching available models');
    const response = await api.get<ApiResponse<AvailableModel[]>>('/models/available/');
    
    if (!response.success) {
      console.warn('Failed to fetch available models:', response.error);
      // Return fallback data if the API call fails
      return getFallbackModels();
    }
    
    console.log('Available models API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching available models:', error);
    // Return fallback data if the API call throws an exception
    return getFallbackModels();
  }
};

// Fallback models data for when the API is unavailable
const getFallbackModels = (): AvailableModel[] => {
  return [
    {
      name: "llama3",
      description: "Meta Llama 3: The most capable openly available LLM to date",
      capabilities: ["chat", "vision"],
      sizes: ["8b", "70b"],
      published: "2024-05-21T16:54:02Z",
      link: "https://ollama.com/library/llama3",
      pulls: "6.7M"
    },
    {
      name: "mistral",
      description: "The 7B model released by Mistral AI, updated to version 0.3.",
      capabilities: ["tools", "chat"],
      sizes: ["7b"],
      published: "2024-08-19T16:54:02Z",
      link: "https://ollama.com/library/mistral",
      pulls: "5.4M"
    },
    {
      name: "gemma",
      description: "Gemma is a family of lightweight, state-of-the-art open models built by Google DeepMind. Updated to version 1.1",
      capabilities: ["chat"],
      sizes: ["2b", "7b"],
      published: "2024-04-21T16:54:02Z",
      link: "https://ollama.com/library/gemma",
      pulls: "4.2M"
    },
    {
      name: "phi3",
      description: "Microsoft's Phi-3 models are state-of-the-art small language models",
      capabilities: ["chat"],
      sizes: ["3.8b", "14b"],
      published: "2024-04-15T10:30:00Z",
      link: "https://ollama.com/library/phi3",
      pulls: "3.1M"
    },
    {
      name: "codellama",
      description: "A large language model that can use text and code prompts to generate and discuss code",
      capabilities: ["code", "chat"],
      sizes: ["7b", "13b", "34b"],
      published: "2024-02-10T14:30:00Z",
      link: "https://ollama.com/library/codellama",
      pulls: "2.8M"
    },
    {
      name: "llava",
      description: "Multimodal model combining LLaMA with visual capabilities",
      capabilities: ["vision", "chat"],
      sizes: ["7b", "13b"],
      published: "2024-01-15T09:45:00Z",
      link: "https://ollama.com/library/llava",
      pulls: "2.5M"
    },
    {
      name: "falcon",
      description: "Falcon is a state-of-the-art language model optimized for efficient deployment",
      capabilities: ["chat"],
      sizes: ["7b", "40b"],
      published: "2023-12-05T11:20:00Z",
      link: "https://ollama.com/library/falcon",
      pulls: "2.2M"
    },
    {
      name: "vicuna",
      description: "Vicuna is a chat assistant trained by fine-tuning LLaMA on user-shared conversations",
      capabilities: ["chat"],
      sizes: ["7b", "13b"],
      published: "2023-11-20T08:15:00Z",
      link: "https://ollama.com/library/vicuna",
      pulls: "2.0M"
    },
    {
      name: "orca-mini",
      description: "Orca Mini is a 7B parameter model fine-tuned on explanation data",
      capabilities: ["chat"],
      sizes: ["3b", "7b"],
      published: "2023-10-10T15:40:00Z",
      link: "https://ollama.com/library/orca-mini",
      pulls: "1.8M"
    },
    {
      name: "stablelm",
      description: "StableLM is a language model optimized for stability and performance",
      capabilities: ["chat"],
      sizes: ["7b"],
      published: "2023-09-25T13:10:00Z",
      link: "https://ollama.com/library/stablelm",
      pulls: "1.5M"
    },
    {
      name: "wizardcoder",
      description: "A code generation model fine-tuned from CodeLlama",
      capabilities: ["code"],
      sizes: ["7b", "13b", "34b"],
      published: "2023-09-05T10:30:00Z",
      link: "https://ollama.com/library/wizardcoder",
      pulls: "1.3M"
    },
    {
      name: "neural-chat",
      description: "A fine-tuned model optimized for dialogue and instruction following",
      capabilities: ["chat"],
      sizes: ["7b"],
      published: "2023-08-15T14:20:00Z",
      link: "https://ollama.com/library/neural-chat",
      pulls: "1.1M"
    }
  ];
};

// React Query hooks
export const useDownloadModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: downloadModel,
    onSuccess: () => {
      // Invalidate the models query to refresh the list after download
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useDownloadStatus = (taskId: string | null) => {
  return useQuery<ModelDownloadStatus | null, Error>({
    queryKey: ['modelDownload', taskId],
    queryFn: async () => {
      // Handle loading state
      if (taskId === 'loading') {
        return {
          id: 'loading',
          model: 'Loading...',
          status: 'loading',
          progress: 0,
          total_size: 0,
          downloaded: 0,
          error: null,
          elapsed_seconds: 0
        } as ModelDownloadStatus;
      }
      
      // Skip if no task ID
      if (!taskId) return null;
      
      try {
        const result = await getDownloadStatus(taskId);
        console.log('Download status result:', result);
        return result;
      } catch (error) {
        console.error('Error fetching download status:', error);
        throw error;
      }
    },
    enabled: !!taskId,
    refetchInterval: (data: any) => {
      // If download is complete or failed, stop polling
      if (data && data.data && (data.data.status === 'success' || data.data.status === 'failed')) {
        return false;
      }
      // Otherwise poll every second
      return 1000;
    },
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
};

export const useAvailableModels = () => {
  return useQuery({
    queryKey: ['availableModels'],
    queryFn: getAvailableModels,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 