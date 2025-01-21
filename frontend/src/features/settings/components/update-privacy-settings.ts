import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { PrivacySettings } from '../types/settings';
import { getSettingsQueryOptions } from '@/features/settings/api/get-settings';
import { useNotifications } from '@/components/notification/notification-store';

export const updatePrivacySettings = async (data: Partial<PrivacySettings>): Promise<PrivacySettings> => {
  const response = await api.patch('/settings/privacy/', data);
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to update privacy settings');
  }
  return response.data;
};

export const useUpdatePrivacySettings = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: updatePrivacySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getSettingsQueryOptions().queryKey });
      notifications.addNotification({
        type: 'success',
        title: 'Settings Updated',
        message: 'Privacy settings have been successfully updated',
      });
    },
  });
};