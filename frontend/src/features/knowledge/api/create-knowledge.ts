import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Knowledge } from '../knowledge';
import { getKnowledgeListQueryOptions } from './get-knowledge-list';

export type CreateKnowledgeInput = {
  data: {
    name: string;
    identifier: string;
    content: string;
  };
};

export const createKnowledge = async ({ data }: CreateKnowledgeInput): Promise<Knowledge> => {
  return api.post('/knowledge/', data);
};

type UseCreateKnowledgeOptions = {
  mutationConfig?: MutationConfig<typeof createKnowledge>;
};

export const useCreateKnowledge = ({ mutationConfig }: UseCreateKnowledgeOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getKnowledgeListQueryOptions().queryKey });
    },
    ...mutationConfig,
    mutationFn: createKnowledge,
  });
}; 