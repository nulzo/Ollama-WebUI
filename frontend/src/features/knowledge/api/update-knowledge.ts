import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Knowledge } from '../knowledge';
import { getKnowledgeListQueryOptions } from './get-knowledge-list';
import { getKnowledgeQueryOptions } from './get-knowledge';

export type UpdateKnowledgeInput = {
  knowledgeId: string;
  data: {
    name?: string;
    identifier?: string;
    content?: string;
  };
};

export const updateKnowledge = async ({
  knowledgeId,
  data,
}: UpdateKnowledgeInput): Promise<Knowledge> => {
  return api.patch(`/knowledge/${knowledgeId}/`, data);
};

type UseUpdateKnowledgeOptions = {
  mutationConfig?: MutationConfig<typeof updateKnowledge>;
};

export const useUpdateKnowledge = ({ mutationConfig }: UseUpdateKnowledgeOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: getKnowledgeListQueryOptions().queryKey });
      queryClient.invalidateQueries({
        queryKey: getKnowledgeQueryOptions({ knowledgeId: variables.knowledgeId }).queryKey,
      });
    },
    ...mutationConfig,
    mutationFn: updateKnowledge,
  });
}; 