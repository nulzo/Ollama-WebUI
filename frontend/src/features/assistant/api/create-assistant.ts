import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Assistant } from '@/features/assistant/types/assistant';

import { getAssistantsQueryOptions } from '@/features/assistant/api/get-assistants';

export const createAssistantInputSchema = z.object({
  external_model_name: z.string().min(1, 'External model name is required'),
  name: z.string().max(100).optional(),
  display_name: z.string().max(100),
  icon: z.string().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  api_key: z.string().max(255).nullable().optional(),
  default_temperature: z.number().optional(),
  default_max_tokens: z.number().optional(),
});

export type CreateAssistantInput = z.infer<typeof createAssistantInputSchema>;

export const createAssistant = ({ data }: { data: CreateAssistantInput }): Promise<Assistant> => {
  return api.post(`/assistant/`, data);
};

type UseCreateAssistantOptions = {
  mutationConfig?: MutationConfig<typeof createAssistant>;
};

export const useCreateAssistant = ({ mutationConfig }: UseCreateAssistantOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getAssistantsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createAssistant,
  });
};
