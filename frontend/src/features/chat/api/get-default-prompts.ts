import { useQuery, queryOptions } from '@tanstack/react-query';
import { ApiResponse } from '@/types/api.ts';
import { api } from '@/lib/api-client.ts';
import { QueryConfig } from '@/lib/query.ts';
import { Prompt, PromptsResponse } from '../types/conversation';

export const getPrompts = async (style?: string, model?: string): Promise<PromptsResponse> => {
  const params = new URLSearchParams();
  if (model) {
    params.append('model', model);
  } else {
    console.warn('No model provided for prompts, using default');
  }
  if (style) params.append('style', style);
  
  const endpoint = `prompts/show/`;

  try {
    const response = await api.get<ApiResponse<PromptsResponse>>(
      endpoint + (params.toString() ? `?${params.toString()}` : '')
    );

    if (!response.success) {
      console.error('Failed to fetch prompts:', response.error);
      throw new Error(response.error?.message || 'Failed to fetch prompts');
    }
    
    // Log the response to verify the model being used
    if (response.data?.metadata?.model) {
      console.log(`Received prompts generated with model: ${response.data.metadata.model}`);
    }
    
    // Ensure we have prompts data
    if (!response.data || !response.data.prompts || response.data.prompts.length === 0) {
      console.warn('Empty prompts received, using fallback');
      // Return fallback prompts based on style
      return getFallbackPrompts(style);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching prompts:', error);
    // Return fallback prompts on error
    return getFallbackPrompts(style);
  }
};

// Fallback prompts in case the API fails
const getFallbackPrompts = (style?: string): PromptsResponse => {
  const fallbackPrompts = {
    creative: [
      { title: "Creative Story", prompt: "Write a short story about a dragon", simple_prompt: "Dragon story", style: "creative" },
      { title: "Superhero Design", prompt: "Design a unique superhero", simple_prompt: "New superhero", style: "creative" },
      { title: "Musical Invention", prompt: "Invent a new musical instrument", simple_prompt: "New instrument", style: "creative" }
    ],
    inspirational: [
      { title: "Motivation", prompt: "Share a motivational quote", simple_prompt: "Motivational quote", style: "inspirational" },
      { title: "Goal Achievement", prompt: "How can I achieve my goals?", simple_prompt: "Achieve goals", style: "inspirational" },
      { title: "Overcoming Challenges", prompt: "Tell me about overcoming challenges", simple_prompt: "Overcome challenges", style: "inspirational" }
    ],
    analytical: [
      { title: "Quantum Computing", prompt: "Explain quantum computing", simple_prompt: "Quantum computing", style: "analytical" },
      { title: "Market Analysis", prompt: "Analyze market trends", simple_prompt: "Market trends", style: "analytical" },
      { title: "Algorithm Comparison", prompt: "Compare different algorithms", simple_prompt: "Compare algorithms", style: "analytical" }
    ],
    casual: [
      { title: "Casual Chat", prompt: "How's your day going?", simple_prompt: "Your day", style: "casual" },
      { title: "Hobbies", prompt: "What's your favorite hobby?", simple_prompt: "Favorite hobby", style: "casual" },
      { title: "Fun Facts", prompt: "Tell me a fun fact", simple_prompt: "Fun fact", style: "casual" }
    ],
    default: [
      { title: "Space Exploration", prompt: "What are the main challenges of space exploration?", simple_prompt: "Space challenges", style: "default" },
      { title: "Future Technology", prompt: "What technology will change the world in the next decade?", simple_prompt: "Future tech", style: "default" },
      { title: "AI Ethics", prompt: "What ethical considerations should guide AI development?", simple_prompt: "AI ethics", style: "default" }
    ]
  };
  
  const selectedStyle = style && style in fallbackPrompts ? style : 'default';
  
  return {
    prompts: fallbackPrompts[selectedStyle as keyof typeof fallbackPrompts],
    metadata: {
      style: selectedStyle,
      provider: 'fallback',
      model: null
    }
  };
};

export const getPromptsQueryOptions = (style?: string, model?: string) => {
  return queryOptions({
    queryKey: ['prompts', style, model],
    queryFn: () => getPrompts(style, model),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

type UsePromptsOptions = {
  style?: string;
  model?: string;
  queryConfig?: QueryConfig<typeof getPromptsQueryOptions>;
};

export const usePrompts = ({ style, model, queryConfig }: UsePromptsOptions = {}) => {
  return useQuery({
    ...getPromptsQueryOptions(style, model),
    ...queryConfig,
  });
};
