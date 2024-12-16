import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Agent } from '@/features/agents/types/agent';
import { ApiResponse } from '@/types/api';

export const getAgent = async ({ agentId }: { agentId: string }): Promise<Agent> => {
  const response = await api.get<ApiResponse<Agent>>(`/agents/${agentId}/`);
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch agent');
  }
  return response.data;
};

export const getAgentQueryOptions = ({ agentId }: { agentId: string }) => ({
  queryKey: ['agents', agentId],
  queryFn: () => getAgent({ agentId }),
});

export const useAgent = ({ agentId }: { agentId: string }) => {
  return useQuery(getAgentQueryOptions({ agentId }));
};
