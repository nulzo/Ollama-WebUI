import { useQuery, queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client.ts';
import { QueryConfig } from '@/lib/query.ts';
import { Conversation } from '@/features/chat/types/conversation';
import { ApiResponse } from '@/types/api.ts';

export const getConversation = async ({
  conversation_id,
}: {
  conversation_id: string;
}): Promise<Conversation> => {
  if (!conversation_id) throw new Error('No conversation ID provided');

  const response = await api.get<ApiResponse<Conversation>>(`/conversations/${conversation_id}/`);
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch conversation');
  }
  return response.data;
};

export const getConversationQueryOptions = (conversation_id: string) => {
  return queryOptions({
    queryKey: ['conversation', conversation_id],
    queryFn: () => getConversation({ conversation_id }),
  });
};

type UseConversationOptions = {
  conversation_id: string;
  queryConfig?: Omit<QueryConfig<typeof getConversation>, 'queryKey' | 'queryFn'>;
};

export const useConversation = ({ conversation_id, queryConfig }: UseConversationOptions) => {
  const query = useQuery({
    queryKey: ['conversation', conversation_id],
    queryFn: () => getConversation({ conversation_id }),
    ...queryConfig,
    enabled: Boolean(conversation_id?.trim()),
    retry: false, // Don't retry on error
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return query;
};
