import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client.ts';
import { ApiResponse } from '@/types/api.ts';
import { MutationConfig } from '@/lib/query.ts';
import { getProviderSettingsQueryOptions } from './get-provider-settings.ts';

export const deleteProviderSetting = ({ providerId }: { providerId: string }) => {
  return api.delete<ApiResponse<void>>(`/providers/${providerId}/`).then(response => {
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete provider setting');
    }
    return response.data;
  });
};

type UseDeleteProviderSettingOptions = {
  mutationConfig?: MutationConfig<typeof deleteProviderSetting>;
};

export const useDeleteProviderSetting = ({
  mutationConfig,
}: UseDeleteProviderSettingOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getProviderSettingsQueryOptions().queryKey });
    },
    ...mutationConfig,
    mutationFn: deleteProviderSetting,
  });
};
