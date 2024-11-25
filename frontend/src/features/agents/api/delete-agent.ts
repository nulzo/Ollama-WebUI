import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { getAgentsQueryOptions } from './get-agents';

export const deleteAgent = ({ agentId }: { agentId: string }) => {
  return api.delete(`/agents/${agentId}/`);
};

type UseDeleteAgentOptions = {
  mutationConfig?: MutationConfig<typeof deleteAgent>;
};

export const useDeleteAgent = ({ mutationConfig }: UseDeleteAgentOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAgentsQueryOptions().queryKey });
    },
    ...mutationConfig,
    mutationFn: deleteAgent,
  });
};