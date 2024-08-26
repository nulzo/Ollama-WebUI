import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query';
import { Discussion, Meta } from '@/types/api';

export const getChats = (): Promise<{
    data: Discussion[];
    meta: Meta;
}> => {
    return api.get(`/discussions`);
};

export const getDiscussionsQueryOptions = ({
                                               page,
                                           }: { page?: number } = {}) => {
    return queryOptions({
        queryKey: page ? ['discussions', { page }] : ['discussions'],
        queryFn: () => getDiscussions(page),
    });
};

type UseDiscussionsOptions = {
    page?: number;
    queryConfig?: QueryConfig<typeof getDiscussionsQueryOptions>;
};

export const useDiscussions = ({
                                   queryConfig,
                                   page,
                               }: UseDiscussionsOptions) => {
    return useQuery({
        ...getDiscussionsQueryOptions({ page }),
        ...queryConfig,
    });
};