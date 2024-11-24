import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query.ts';

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    id: string;
    role: string;
    created_at: string;
    conversation: string;
    conversation_uuid: string;
  }[];
}

export const getMessages = (
  conversation_id: string
): Promise<PaginatedResponse> => {
  return api.get(`/messages/`, {
    conversation: conversation_id
  });
};

export const getMessagesQueryOptions = ({ conversation_id }: { conversation_id?: string } = {}) => {
  return queryOptions({
    queryKey: conversation_id ? ['messages', { conversation_id }] : ['messages'],
    queryFn: () => getMessages(conversation_id ?? ''),
  });
};

type UseMessagesOptions = {
  conversation_id?: string;
  queryConfig?: QueryConfig<typeof getMessages>;
};

export const useMessages = ({ conversation_id, queryConfig }: UseMessagesOptions) => {
  return useQuery({
    ...getMessagesQueryOptions({ conversation_id }),
    ...queryConfig,
    enabled: Boolean(conversation_id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};