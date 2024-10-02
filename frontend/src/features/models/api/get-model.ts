import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query.ts';
import { Meta } from '@/types/api.ts';
import { OllamaModelData } from '@/features/models/types/models';

export const getModel = (
  id: string
): Promise<{
  data: OllamaModelData;
  meta: Meta;
}> => {
  return api.get(`/models/ollama/${id}`);
};

export const getModelQueryOptions = (id: string) => {
  return queryOptions({
    queryKey: ['model', { id }],
    queryFn: () => getModel(id),
  });
};

type UseModelOptions = {
  queryConfig?: QueryConfig<typeof getModel>;
  id: string;
};

export const useModel = ({ queryConfig, id }: UseModelOptions) => {
  return useQuery({
    ...getModelQueryOptions(id),
    ...queryConfig,
  });
};
