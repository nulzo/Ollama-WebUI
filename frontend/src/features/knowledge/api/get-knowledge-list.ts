import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { KnowledgeList } from '../knowledge';
import { QueryConfig } from '@/lib/query';

export const getKnowledgeList = async (): Promise<KnowledgeList> => {
  return api.get('/knowledge/');
};

type UseKnowledgeListOptions = {
  queryConfig?: QueryConfig<typeof getKnowledgeList>;
};

export const getKnowledgeListQueryOptions = () => {
  return {
    queryKey: ['knowledge-list'],
    queryFn: getKnowledgeList,
  };
};

export const useKnowledgeList = ({ queryConfig }: UseKnowledgeListOptions = {}) => {
  return useQuery({
    ...getKnowledgeListQueryOptions(),
    ...queryConfig,
  });
}; 