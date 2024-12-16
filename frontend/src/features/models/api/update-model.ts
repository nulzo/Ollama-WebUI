import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Conversation } from '@/features/chat/types/conversation';
import { getModelQueryOptions } from './get-model';

export const updateModelInputSchema = z.object({
  name: z.string().max(150).nullable().optional(),
  display_name: z.string().max(150).nullable().optional(),
  icon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  api_key: z.string().nullable().optional(),
  default_temperature: z.number().nullable().optional(),
  default_max_tokens: z.number().nullable().optional(),
});

export type updateModelInput = z.infer<typeof updateModelInputSchema>;

export const updateModel = ({
  data,
  model_id,
}: {
  data: updateModelInput;
  model_id: string;
}): Promise<Conversation> => {
  return api.patch(`/assistant/${model_id}/`, data);
};

type UseUpdateModelOptions = {
  mutationConfig?: MutationConfig<typeof updateModel>;
};

export const useUpdateModel = ({ mutationConfig }: UseUpdateModelOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getModelQueryOptions(data.uuid).queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateModel,
  });
};
