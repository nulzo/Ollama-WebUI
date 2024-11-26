import { useQuery, queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query';
import { Conversation } from '@/features/conversation/types/conversation';

export const getConversation = ({ conversation_id }: { conversation_id: string }): Promise<{ data: Conversation }> => {
  if (!conversation_id) return Promise.reject('No conversation ID provided');
  return api.get(`/conversations/${conversation_id}/`);
};

export const getConversationQueryOptions = (conversation_id: string) => {
  return queryOptions({
    queryKey: ['conversation', conversation_id],
    queryFn: () => getConversation({ conversation_id }),
  });
};

type UseConversationOptions = {
  conversation_id: string;
  queryConfig?: QueryConfig<typeof getConversation>;
};

export const useConversation = ({ conversation_id, queryConfig }: UseConversationOptions) => {
  const query = useQuery({
    queryKey: ['conversation', conversation_id],
    queryFn: () => getConversation({ conversation_id }),
    ...queryConfig,
    enabled: Boolean(conversation_id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return query;
};