import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Agent } from '@/features/agents/types/agent';
import { CreateAgentInput } from './create-agent';
import { getAgentsQueryOptions } from './get-agents';

export type UpdateAgentInput = Partial<CreateAgentInput>;

export const updateAgent = ({
  agentId,
  data,
}: {
  agentId: string;
  data: UpdateAgentInput;
}): Promise<Agent> => {
  return api.put(`/agents/${agentId}/`, data);
};

type UseUpdateAgentOptions = {
  mutationConfig?: MutationConfig<typeof updateAgent>;
};

export const useUpdateAgent = ({ mutationConfig }: UseUpdateAgentOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: getAgentsQueryOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: ['agents', agentId] });
    },
    ...mutationConfig,
    mutationFn: updateAgent,
  });
};
