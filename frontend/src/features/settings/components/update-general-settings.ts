import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { GeneralSettings, PromptSettings } from '../types/settings';
import { getSettingsQueryOptions } from '@/features/settings/api/get-settings';
import { useNotifications } from '@/components/notification/notification-store';

interface UpdateSettingsPayload {
  general?: Partial<GeneralSettings>;
  prompt_settings?: PromptSettings;
  [key: string]: any;
}

export const updateGeneralSettings = async (data: UpdateSettingsPayload): Promise<any> => {
  console.log('Sending update settings request with data:', data);
  
  // Ensure prompt_settings is properly formatted
  if (data.prompt_settings) {
    console.log('Prompt settings before request:', data.prompt_settings);
  }
  
  const response = await api.patch('/users/update_settings/', data) as {
    success: boolean;
    data: any;
    error?: { message: string };
  };
  
  if (!response.success) {
    console.error('Failed to update settings:', response.error);
    throw new Error(response.error?.message || 'Failed to update general settings');
  }
  
  console.log('Settings update response:', response.data);
  return response.data;
};

export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: updateGeneralSettings,
    onSuccess: (data) => {
      console.log('Settings updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: getSettingsQueryOptions().queryKey });
      notifications.addNotification({
        type: 'success',
        title: 'Settings Updated',
        message: 'Settings have been successfully updated',
      });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      notifications.addNotification({
        type: 'error',
        title: 'Settings Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update settings',
      });
    }
  });
};