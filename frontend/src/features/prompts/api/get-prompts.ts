import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Prompt } from '../prompt';

export const getPrompts = (): Promise<Prompt[]> => {
  return api.get('/custom-prompts/');
};

export const getPromptsQueryOptions = () => ({
  queryKey: ['prompts'],
  queryFn: getPrompts,
});

export const usePrompts = () => {
  return useQuery(getPromptsQueryOptions());
};