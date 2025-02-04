import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Prompt } from '../prompt';
import { getPromptsQueryOptions } from './get-prompts';

export type CreatePromptInput = {
  data: {
    title: string;
    description?: string;
    content: string;
    tags?: string[];
  };
};

export const createPrompt = ({ data }: CreatePromptInput): Promise<Prompt> => {
  return api.post('/custom-prompts/', data);
};

type UseCreatePromptOptions = {
  mutationConfig?: MutationConfig<typeof createPrompt>;
};

export const useCreatePrompt = ({ mutationConfig }: UseCreatePromptOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPromptsQueryOptions().queryKey });
    },
    ...mutationConfig,
    mutationFn: createPrompt,
  });
};