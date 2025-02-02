import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { ProviderSettings } from '@/types/provider-settings';
import { getProviderSettingsQueryOptions } from './get-provider-settings';
import { useNotifications } from '@/components/notification/notification-store';
import { ApiResponse } from '@/types/api';
import { useErrorStore } from '@/components/errors/error-store';

export const createProviderSettingsSchema = z.object({
  provider_type: z.string(),
  api_key: z.string().optional(),
  endpoint: z.string().optional(),
  organization_id: z.string().optional(),
  is_enabled: z.boolean(),
});

export type CreateProviderSettingsInput = z.infer<typeof createProviderSettingsSchema>;

export const createProviderSettings = async ({
  data,
}: {
  data: CreateProviderSettingsInput;
}): Promise<ProviderSettings> => {
  const response = await api.post<ApiResponse<ProviderSettings>>('/providers/', data);
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to create provider settings');
  }
  return response.data;
};

type UseCreateProviderSettingsOptions = {
  mutationConfig?: MutationConfig<typeof createProviderSettings>;
};

export const useCreateProviderSettings = ({ 
  mutationConfig 
}: UseCreateProviderSettingsOptions = {}) => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: getProviderSettingsQueryOptions().queryKey 
      });
      notifications.addNotification({
        type: 'success',
        title: 'Settings Created',
        message: 'Provider settings have been successfully created',
      });
    },
    onError: (error: Error) => {
      useErrorStore.getState().showError({
        status: 500,
        message: error.message,
      });
    },
    ...mutationConfig,
    mutationFn: createProviderSettings,
  });
};