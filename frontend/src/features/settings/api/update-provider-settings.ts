import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client.ts';
import { ProviderSettings } from '@/types/provider-settings.ts';
import { ApiResponse } from '@/types/api.ts';
import { MutationConfig } from '@/lib/query.ts';
import { getProviderSettingsQueryOptions } from './get-provider-settings.ts';
import { useNotifications } from '@/components/notification/notification-store.ts';

export const updateProviderSetting = ({
  providerId,
  data,
}: {
  providerId: string;
  data: Partial<ProviderSettings>;
}): Promise<ProviderSettings> => {
  return api
    .patch<ApiResponse<ProviderSettings>>(`/providers/${providerId}/`, data)
    .then(response => {
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update provider setting');
      }
      return response.data;
    });
};

type UseUpdateProviderSettingOptions = {
  mutationConfig?: MutationConfig<typeof updateProviderSetting>;
};

export const useUpdateProviderSetting = ({
  mutationConfig,
}: UseUpdateProviderSettingOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: getProviderSettingsQueryOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: ['providerSettings', providerId] });
      useNotifications.getState().addNotification({
        type: 'success',
        title: 'Settings Updated',
        message: 'Provider settings have been successfully updated',
      });
    },
    ...mutationConfig,
    mutationFn: updateProviderSetting,
  });
};
