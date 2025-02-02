import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { ProviderSettings } from '@/types/provider-settings';
import { getProviderSettingsQueryOptions } from './get-provider-settings';
import { useNotifications } from '@/components/notification/notification-store';
import { ApiResponse } from '@/types/api';
import { useErrorStore } from '@/components/errors/error-store';

export const updateProviderSettingsSchema = z.object({
  provider_type: z.string(),
  api_key: z.string().optional(),
  endpoint: z.string().optional(),
  organization_id: z.string().optional(),
  is_enabled: z.boolean(),
  default_model: z.string().optional(),
});

export type UpdateProviderSettingsInput = z.infer<typeof updateProviderSettingsSchema>;

export const updateProviderSettings = async ({
  providerId,
  data,
}: {
  providerId: string;
  data: UpdateProviderSettingsInput;
}): Promise<ProviderSettings> => {
  const response = await api.patch<ApiResponse<ProviderSettings>>(
    `/providers/${providerId}/`, 
    data
  );
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to update provider settings');
  }
  return response.data;
};

type UseUpdateProviderSettingsOptions = {
  mutationConfig?: MutationConfig<typeof updateProviderSettings>;
};

export const useUpdateProviderSettings = ({ 
  mutationConfig 
}: UseUpdateProviderSettingsOptions = {}) => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    onSuccess: (_, { providerId }) => {
      queryClient.invalidateQueries({ 
        queryKey: getProviderSettingsQueryOptions().queryKey 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['models'] // Also invalidate models query
      });
      notifications.addNotification({
        type: 'success',
        title: 'Settings Updated',
        message: 'Provider settings have been successfully updated',
      });
    },
    onError: (error: Error) => {
      useErrorStore.getState().showError({
        status: 500,
        message: error.message,
      });
    },
    ...mutationConfig,
    mutationFn: updateProviderSettings,
  });
};