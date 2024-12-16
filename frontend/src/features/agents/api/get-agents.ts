import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Agent } from '@/features/agents/types/agent';
import { ApiResponse } from '@/types/api';

export const getAgents = async (): Promise<Agent[]> => {
  const response: ApiResponse<Agent[]> = await api.get<ApiResponse<Agent[]>>('/agents/');
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch agents');
  }
  return response.data;
};

export const getAgentsQueryOptions = () => ({
  queryKey: ['agents'],
  queryFn: () => getAgents(),
});

export const useAgents = () => {
  return useQuery(getAgentsQueryOptions());
};
