import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Prompt } from '../prompt';
import { CreatePromptInput } from './create-prompt';
import { getPromptsQueryOptions } from './get-prompts';

export type UpdatePromptInput = Partial<CreatePromptInput>;

export const updatePrompt = ({
  promptId,
  data,
}: {
  promptId: string;
  data: UpdatePromptInput;
}): Promise<Prompt> => {
  return api.put(`/custom-prompts/${promptId}/`, data);
};

type UseUpdatePromptOptions = {
  mutationConfig?: MutationConfig<typeof updatePrompt>;
};

export const useUpdatePrompt = ({ mutationConfig }: UseUpdatePromptOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: getPromptsQueryOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: ['prompts', promptId] });
    },
    ...mutationConfig,
    mutationFn: updatePrompt,
  });
};
