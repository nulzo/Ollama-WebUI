import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { GeneralSettings, PromptSettings } from '../types/settings';
import { useNotifications } from '@/components/notification/notification-store';

interface UpdateSettingsPayload {
  general?: Partial<GeneralSettings>;
  prompt_settings?: PromptSettings;
  [key: string]: any;
}

export const updateGeneralSettings = async (data: UpdateSettingsPayload): Promise<any> => {
  console.log('Sending update settings request with data:', JSON.stringify(data, null, 2));
  
  // Ensure prompt_settings is properly formatted
  if (data.prompt_settings) {
    // Make sure use_llm_generated is explicitly a boolean
    if (data.prompt_settings.use_llm_generated !== undefined) {
      // Force it to be a boolean
      data.prompt_settings.use_llm_generated = Boolean(data.prompt_settings.use_llm_generated);
      console.log(`Ensuring use_llm_generated is boolean: ${data.prompt_settings.use_llm_generated} (${typeof data.prompt_settings.use_llm_generated})`);
    }
    
    console.log('Prompt settings before request:', JSON.stringify(data.prompt_settings, null, 2));
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
  
  console.log('Settings update response:', JSON.stringify(response.data, null, 2));
  return response.data;
};

export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation({
    mutationFn: updateGeneralSettings,
    onSuccess: (data) => {
      console.log('Settings updated successfully:', data);
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.refetchQueries({ queryKey: ['settings'] });
      // Also invalidate prompts to ensure they use the new model
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
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