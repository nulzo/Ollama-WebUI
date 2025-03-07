import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

// Delete a model
export const deleteModel = async (modelName: string, provider: string = 'ollama'): Promise<boolean> => {
  const response = await api.delete<ApiResponse<boolean>>(`/models/${provider}/${modelName}`);
  
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to delete model');
  }
  
  return response.data;
};

// React Query hook
export const useDeleteModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ modelName, provider = 'ollama' }: { modelName: string; provider?: string }) => 
      deleteModel(modelName, provider),
    onSuccess: () => {
      // Invalidate the models query to refresh the list after deletion
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
}; 