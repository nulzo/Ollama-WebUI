import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Tool } from '@/features/tools/types/tool';
import { ApiResponse } from '@/types/api';

export const getTools = async (): Promise<ApiResponse<Tool[]>> => {
  const response = await api.get<ApiResponse<Tool[]>>('/tools/');
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch tools');
  }
  return response;
};

export const getToolsQueryOptions = () => ({
  queryKey: ['tools'],
  queryFn: () => getTools(),
});

export const useTools = () => {
  return useQuery(getToolsQueryOptions());
};
