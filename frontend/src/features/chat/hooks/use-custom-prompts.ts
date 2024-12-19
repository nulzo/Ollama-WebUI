import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export interface CustomPrompt {
  id: string;
  title: string;
  command: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useCustomPrompts = () => {
  const queryClient = useQueryClient();

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['custom-prompts'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<CustomPrompt[]>>('/custom-prompts/');
      return response.data;
    },
  });

  const createPrompt = useMutation({
    mutationFn: async (newPrompt: Partial<CustomPrompt>) => {
      const response = await api.post<ApiResponse<CustomPrompt>>('/custom-prompts/', newPrompt);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-prompts'] });
    },
  });

  return {
    prompts,
    isLoading,
    createPrompt,
  };
};
