import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

interface DeleteToolInput {
  toolId: string;
}

export const deleteTool = async ({ toolId }: DeleteToolInput): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/tools/${toolId}/`);
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to delete tool');
  }
};

export const useDeleteTool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
    },
  });
};
