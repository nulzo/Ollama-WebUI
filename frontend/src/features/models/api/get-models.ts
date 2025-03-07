import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ProviderModels } from '@/features/models/types/models';
import { ApiResponse } from '@/types/api';
import { QueryConfig } from '@/lib/query';

export const getModels = async (): Promise<ProviderModels> => {
  const response = await api.get<ApiResponse<ProviderModels>>('/models/');
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch models');
  }
  return response.data;
};

export const getModelsQueryOptions = () => {
  return queryOptions({
    queryKey: ['models'],
    queryFn: () => getModels(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

type UseModelsOptions = {
  queryConfig?: QueryConfig<typeof getModels>;
};

export const useModels = ({ queryConfig }: UseModelsOptions = {}) => {
  return useQuery({
    ...getModelsQueryOptions(),
    ...queryConfig,
  });
};
