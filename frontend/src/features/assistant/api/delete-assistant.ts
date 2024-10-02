import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';

import { getAssistantsQueryOptions } from '@/features/assistant/api/get-assistants';

export const deleteAssistant = ({ assistantId }: { assistantId: number }) => {
  return api.delete(`/assistant/${assistantId}/`);
};

type UseDeleteAssistantOptions = {
  mutationConfig?: MutationConfig<typeof deleteAssistant>;
};

export const useDeleteAssistant = ({ mutationConfig }: UseDeleteAssistantOptions = {}) => {
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
    mutationFn: deleteAssistant,
  });
};
