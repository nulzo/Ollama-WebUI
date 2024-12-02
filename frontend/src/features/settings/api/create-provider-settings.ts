import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client.ts';
import { ProviderSettings } from '@/types/provider-settings.ts';
import { ApiResponse } from '@/types/api.ts';
import { MutationConfig } from '@/lib/query.ts';
import { getProviderSettingsQueryOptions } from './get-provider-settings.ts';

export const createProviderSetting = ({
  data,
}: {
  data: Partial<ProviderSettings>;
}): Promise<ProviderSettings> => {
  return api.post<ApiResponse<ProviderSettings>>('/providers/', data).then(response => {
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create provider setting');
    }
    return response.data;
  });
};

type UseCreateProviderSettingOptions = {
  mutationConfig?: MutationConfig<typeof createProviderSetting>;
};

export const useCreateProviderSetting = ({
  mutationConfig,
}: UseCreateProviderSettingOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getProviderSettingsQueryOptions().queryKey });
    },
    ...mutationConfig,
    mutationFn: createProviderSetting,
  });
};
