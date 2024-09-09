import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { Conversation } from '@/features/conversation/types/conversation';
import { Meta } from '@/types/api.ts';

export const getConversations = (): Promise<{
  data: Conversation[];
  meta: Meta;
}> => {
  return api.get(`/conversations/`);
};

export const getConversationsQueryOptions = () => {
  return queryOptions({
    queryKey: ['conversations'],
    queryFn: () => getConversations(),
  });
};

export const useConversations = () => {
  return useQuery({
    ...getConversationsQueryOptions(),
  });
};
