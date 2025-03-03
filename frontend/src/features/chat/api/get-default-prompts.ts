import { useQuery, queryOptions } from '@tanstack/react-query';
import { ApiResponse } from '@/types/api.ts';
import { api } from '@/lib/api-client.ts';
import { QueryConfig } from '@/lib/query.ts';
import { Prompt, PromptsResponse } from '../types/conversation';

export const getPrompts = async (style?: string, model?: string): Promise<PromptsResponse> => {
  const params = new URLSearchParams();
  if (model) params.append('model', model);
  if (style) params.append('style', style);
  
  // Debug the request
  console.log(`Fetching prompts with style: ${style}, model: ${model}`);
  
  // Use the correct DRF action URL format
  const endpoint = `prompts/show/`;
  console.log(`Request URL: ${endpoint}?${params.toString()}`);

  try {
    console.log('Making API request for prompts...');
    const response = await api.get<ApiResponse<PromptsResponse>>(
      endpoint + (params.toString() ? `?${params.toString()}` : '')
    );
    console.log('Raw API response:', response);

    if (!response.success) {
      console.error('Failed to fetch prompts:', response.error);
      throw new Error(response.error?.message || 'Failed to fetch prompts');
    }

    console.log('Prompts response data:', response.data);
    
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
      { title: "Creative Story", prompt: "Write a short story about a dragon", style: "creative" },
      { title: "Superhero Design", prompt: "Design a unique superhero", style: "creative" },
      { title: "Musical Invention", prompt: "Invent a new musical instrument", style: "creative" }
    ],
    inspirational: [
      { title: "Motivation", prompt: "Share a motivational quote", style: "inspirational" },
      { title: "Goal Achievement", prompt: "How can I achieve my goals?", style: "inspirational" },
      { title: "Overcoming Challenges", prompt: "Tell me about overcoming challenges", style: "inspirational" }
    ],
    analytical: [
      { title: "Quantum Computing", prompt: "Explain quantum computing", style: "analytical" },
      { title: "Market Analysis", prompt: "Analyze market trends", style: "analytical" },
      { title: "Algorithm Comparison", prompt: "Compare different algorithms", style: "analytical" }
    ],
    casual: [
      { title: "Casual Chat", prompt: "How's your day going?", style: "casual" },
      { title: "Hobbies", prompt: "What's your favorite hobby?", style: "casual" },
      { title: "Fun Facts", prompt: "Tell me a fun fact", style: "casual" }
    ],
    default: [
      { title: "Space Exploration", prompt: "What are the main challenges of space exploration?", style: "default" },
      { title: "Future Technology", prompt: "What technology will change the world in the next decade?", style: "default" },
      { title: "AI Ethics", prompt: "What ethical considerations should guide AI development?", style: "default" }
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
