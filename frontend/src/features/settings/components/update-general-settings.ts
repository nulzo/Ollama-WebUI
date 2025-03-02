import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { GeneralSettings } from '../types/settings';
import { getSettingsQueryOptions } from '@/features/settings/api/get-settings';
import { useNotifications } from '@/components/notification/notification-store';

export const updateGeneralSettings = async (data: Partial<GeneralSettings>): Promise<GeneralSettings> => {
  const response = await api.patch('/users/update_settings/', data) as {
    success: boolean;
    data: GeneralSettings;
    error?: { message: string };
  };
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to update general settings');
  }
  return response.data;
};

export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: updateGeneralSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getSettingsQueryOptions().queryKey });
      notifications.addNotification({
        type: 'success',
        title: 'Settings Updated',
        message: 'General settings have been successfully updated',
      });
    },
  });
};