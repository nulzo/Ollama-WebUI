import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client.ts';
import { ProviderSettings } from '@/types/provider-settings.ts';
import { ApiResponse } from '@/types/api.ts';

export const getProviderSettings = async (): Promise<ProviderSettings[]> => {
  const response = await api.get<ApiResponse<ProviderSettings[]>>('/providers/');
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch provider settings');
  }
  return response.data;
};

export const getProviderSettingsQueryOptions = () => ({
  queryKey: ['providerSettings'],
  queryFn: () => getProviderSettings(),
});

export const useProviderSettings = () => {
  return useQuery(getProviderSettingsQueryOptions());
};
