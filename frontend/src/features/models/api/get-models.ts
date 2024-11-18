import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query.ts';
import { Meta } from '@/types/api.ts';
import { OllamaModelData } from '@/features/models/types/models';

export const getModels = (): Promise<{
  models: OllamaModelData[];
  meta: Meta;
}> => {
  return api.get(`/models/ollama/`);
};

export const getModelsQueryOptions = () => {
  return queryOptions({
    queryKey: ['models'],
    queryFn: () => getModels(),
    staleTime: 60 * 1000 * 5,
    refetchInterval: 60 * 1000 * 5,
  });
};

type UseModelsOptions = {
  queryConfig?: QueryConfig<typeof getModels>;
};

export const useModels = ({ queryConfig }: UseModelsOptions  = {}) => {
  return useQuery({
    ...getModelsQueryOptions(),
    ...queryConfig,
  });
};
