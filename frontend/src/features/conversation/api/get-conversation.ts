import { useQuery, queryOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query';
import { Conversation } from '@/features/conversation/types/conversation';

export const getConversation = ({
  conversationID,
}: {
  conversationID: string;
}): Promise<{ data: Conversation }> => {
  return api.get(`/conversations?=${conversationID}`);
};

export const getConversationQueryOptions = (conversationID: string) => {
  return queryOptions({
    queryKey: ['conversations', conversationID],
    queryFn: () => getConversation({ conversationID }),
  });
};

type UseConversationOptions = {
  conversationID: string;
  queryConfig?: QueryConfig<typeof getConversationQueryOptions>;
};

export const useConversation = ({ conversationID, queryConfig }: UseConversationOptions) => {
  return useQuery({
    ...getConversationQueryOptions(conversationID),
    ...queryConfig,
    enabled: !!conversationID,
  });
};
