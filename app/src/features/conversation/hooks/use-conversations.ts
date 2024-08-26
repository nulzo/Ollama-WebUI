import {useMutation, useQueryClient} from "@tanstack/react-query";
import {MutationConfig} from "@/lib/query.ts";
import { settingsService } from '@/services/storage/client.ts';

type UseConversationsOptions = {
    mutationConfig?: MutationConfig<any>;
};

export const getDiscussionsQueryOptions = () => {
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