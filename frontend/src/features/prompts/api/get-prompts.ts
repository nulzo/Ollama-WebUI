import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Prompt } from '../prompt';
import { ApiResponse } from '@/types/api';

export const getPrompts = (): Promise<ApiResponse<Prompt[]>> => {
  return api.get('/custom-prompts/');
};

export const getPromptsQueryOptions = () => ({
  queryKey: ['prompts'],
  queryFn: getPrompts,
});

export const usePrompts = () => {
  return useQuery(getPromptsQueryOptions());
};