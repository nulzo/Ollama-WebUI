import { useQuery, queryOptions } from '@tanstack/react-query';
import { ApiResponse } from '@/types/api.ts';
import { api } from '@/lib/api-client.ts';
import { QueryConfig } from '@/lib/query.ts';
import { Prompt, PromptsResponse } from '../types/conversation';

export const getPrompts = async (style?: string, model?: string): Promise<PromptsResponse> => {
  const params = new URLSearchParams();
  if (model) params.append('model', model);
  
  // Debug the request
  console.log(`Fetching prompts with style: ${style}, model: ${model}`);
  console.log(`Request URL: /prompts/show/${style || ''}?${params.toString()}`);

  try {
    const response = await api.get<ApiResponse<PromptsResponse>>(
      `/prompts/show/${style || ''}?${params.toString()}`
    );

    if (!response.success) {
      console.error('Failed to fetch prompts:', response.error);
      throw new Error(response.error?.message || 'Failed to fetch prompts');
    }

    console.log('Prompts response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching prompts:', error);
    throw error;
  }
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
