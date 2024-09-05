import { queryOptions, useQuery } from '@tanstack/react-query';
import { conversationService } from '@/services/storage/client';

export const getConversations = () => {
  return queryOptions({
    queryKey: ['conversations'],
    queryFn: () => {
      return conversationService.fetchConversations();
    },
  });
};

export const useConversations = () => {
  return useQuery({
    ...getConversations(),
  });
};
