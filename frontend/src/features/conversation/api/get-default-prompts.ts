import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query';

export type Prompt = {
  title: string;
  prompt: string;
};

export const getPrompts = (): Promise<{ prompts: Prompt[] }> => {
  return api.get(`/ollama/default/`);
};

export const getPromptsQueryOptions = () => {
  return queryOptions({
    queryKey: ['ollama', 'prompts'],
    queryFn: () => getPrompts(),
  });
};

type UsePromptsOptions = {
  queryConfig?: QueryConfig<typeof getPromptsQueryOptions>;
};

export const usePrompts = ({ queryConfig }: UsePromptsOptions = {}) => {
  return useQuery({
    ...getPromptsQueryOptions(),
    ...queryConfig,
  });
};