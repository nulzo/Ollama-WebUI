import { queryOptions, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ProviderSettings } from '@/types/provider-settings';
import { ApiResponse } from '@/types/api';
import { QueryConfig } from '@/lib/query';

export const getProviderSettings = async (): Promise<ProviderSettings[]> => {
  const response = await api.get<ApiResponse<ProviderSettings[]>>('/provider-settings/');
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch provider settings');
  }
  return response.data;
};

export const getProviderSettingsQueryOptions = () => {
  return queryOptions({
    queryKey: ['providerSettings'],
    queryFn: () => getProviderSettings(),
  });
};

type UseProviderSettingsOptions = {
  queryConfig?: QueryConfig<typeof getProviderSettings>;
};

export const useProviderSettings = ({ queryConfig }: UseProviderSettingsOptions = {}) => {
  return useQuery({
    ...getProviderSettingsQueryOptions(),
    ...queryConfig,
  });
};