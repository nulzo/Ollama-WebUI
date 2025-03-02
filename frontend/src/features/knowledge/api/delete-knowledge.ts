import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { getKnowledgeListQueryOptions } from './get-knowledge-list';

export type DeleteKnowledgeInput = {
  knowledgeId: string;
};

export const deleteKnowledge = ({ knowledgeId }: DeleteKnowledgeInput): Promise<void> => {
  return api.delete(`/knowledge/${knowledgeId}/`);
};

type UseDeleteKnowledgeOptions = {
  mutationConfig?: MutationConfig<typeof deleteKnowledge>;
};

export const useDeleteKnowledge = ({ mutationConfig }: UseDeleteKnowledgeOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getKnowledgeListQueryOptions().queryKey });
    },
    ...mutationConfig,
    mutationFn: deleteKnowledge,
  });
}; 