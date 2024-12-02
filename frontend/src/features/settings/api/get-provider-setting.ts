import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client.ts';
import { ProviderSettings } from '@/types/provider-settings.ts';
import { ApiResponse } from '@/types/api.ts';

export const getProviderSetting = async ({
  providerId,
}: {
  providerId: string;
}): Promise<ProviderSettings> => {
  const response = await api.get<ApiResponse<ProviderSettings>>(`/providers/${providerId}/`);
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch provider setting');
  }
  return response.data;
};

export const getProviderSettingQueryOptions = ({ providerId }: { providerId: string }) => ({
  queryKey: ['providerSettings', providerId],
  queryFn: () => getProviderSetting({ providerId }),
});

export const useProviderSetting = ({ providerId }: { providerId: string }) => {
  return useQuery(getProviderSettingQueryOptions({ providerId }));
};
