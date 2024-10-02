import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { getAssistantsQueryOptions } from '@/features/assistant/api/get-assistants';
import { Assistant } from '@/features/assistant/types/assistant';

export const updateAssistantInputSchema = z.object({
  name: z.string().max(100).optional(),
  display_name: z.string().max(100).optional(),
  icon: z.string().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  api_key: z.string().max(255).nullable().optional(),
  default_temperature: z.number().optional(),
  default_max_tokens: z.number().optional(),
});

export type UpdateAssistantInput = z.infer<typeof updateAssistantInputSchema>;

export const updateAssistant = ({
  data,
  assistantId,
}: {
  data: UpdateAssistantInput;
  assistantId: number;
}): Promise<Assistant> => {
  return api.patch(`/assistant/${assistantId}/`, data);
};

type UseUpdateAssistantOptions = {
  mutationConfig?: MutationConfig<typeof updateAssistant>;
};

export const useUpdateAssistant = ({ mutationConfig }: UseUpdateAssistantOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getAssistantsQueryOptions().queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateAssistant,
  });
};
