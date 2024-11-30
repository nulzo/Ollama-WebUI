import { useQuery, queryOptions } from '@tanstack/react-query';
import { ApiResponse } from '@/types/api';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query';

export type Prompt = {
  title: string;
  prompt: string;
};

export type PromptList = {
  prompts: Prompt[];
};

export const getPrompts = async (style?: string): Promise<PromptList> => {
  const response = await api.get<ApiResponse<PromptList>>(`/prompts/${style || ''}`);
  if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch prompts');
  }
  console.log(response.data);
  return response.data;
};

export const getPromptsQueryOptions = (style?: string) => {
  return queryOptions({
    queryKey: ['ollama', 'prompts', style],
    queryFn: () => getPrompts(style),
  });
};

type UsePromptsOptions = {
  style?: string;
  queryConfig?: QueryConfig<typeof getPromptsQueryOptions>;
};

export const usePrompts = ({ style, queryConfig }: UsePromptsOptions = {}) => {
  return useQuery({
    ...getPromptsQueryOptions(style),
    ...queryConfig,
  });
};