import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { getPromptsQueryOptions } from './get-prompts';

export const deletePrompt = ({ promptId }: { promptId: string }) => {
  return api.delete(`/custom-prompts/${promptId}/`);
};

type UseDeletePromptOptions = {
  mutationConfig?: MutationConfig<typeof deletePrompt>;
};

export const useDeletePrompt = ({ mutationConfig }: UseDeletePromptOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPromptsQueryOptions().queryKey });
    },
    ...mutationConfig,
    mutationFn: deletePrompt,
  });
};
