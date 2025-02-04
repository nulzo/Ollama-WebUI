import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Prompt } from '../prompt';
import { ApiResponse } from '@/types/api';

export const getPrompt = async ({ promptId }: { promptId: string }): Promise<Prompt> => {
  const response = await api.get<ApiResponse<Prompt>>(`/custom-prompts/${promptId}/`);
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch prompt');
  }
  return response.data;
};

export const getPromptQueryOptions = ({ promptId }: { promptId: string }) => ({
  queryKey: ['prompts', promptId],
  queryFn: () => getPrompt({ promptId }),
});

export const usePrompt = ({ promptId }: { promptId: string }) => {
  return useQuery(getPromptQueryOptions({ promptId }));
};
