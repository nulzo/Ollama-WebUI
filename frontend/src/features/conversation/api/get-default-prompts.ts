import { useQuery, queryOptions } from '@tanstack/react-query';
import { ApiResponse } from '@/types/api';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query';
import { Prompt, PromptsResponse } from '../types/conversation';

export const getPrompts = async (style?: string, model?: string): Promise<PromptsResponse> => {
  const params = new URLSearchParams();
  if (model) params.append('model', model);
  
  const response = await api.get<ApiResponse<PromptsResponse>>(
    `/prompts/${style || ''}?${params.toString()}`
  );
  
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch prompts');
  }
  
  return response.data;
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