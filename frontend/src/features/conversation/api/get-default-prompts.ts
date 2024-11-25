import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query';

export type Prompt = {
  title: string;
  prompt: string;
};

export const getPrompts = (style?: string): Promise<{ prompts: Prompt[] }> => {
  return api.get(`/ollama/default/${style || ''}`);
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