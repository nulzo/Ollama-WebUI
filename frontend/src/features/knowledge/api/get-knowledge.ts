import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Knowledge } from '../knowledge';
import { QueryConfig } from '@/lib/query';

export const getKnowledge = async ({ knowledgeId }: { knowledgeId: string }): Promise<Knowledge> => {
  return api.get(`/knowledge/${knowledgeId}/`);
};

type UseKnowledgeOptions = {
  knowledgeId: string;
  queryConfig?: QueryConfig<typeof getKnowledge>;
};

export const getKnowledgeQueryOptions = ({ knowledgeId }: { knowledgeId: string }) => {
  return {
    queryKey: ['knowledge', knowledgeId],
    queryFn: () => getKnowledge({ knowledgeId }),
  };
};

export const useKnowledge = ({ knowledgeId, queryConfig }: UseKnowledgeOptions) => {
  return useQuery({
    ...getKnowledgeQueryOptions({ knowledgeId }),
    ...queryConfig,
  });
}; 