import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client.ts';
import { Conversation } from '../types/conversation';
import { ApiResponse } from '@/types/api.ts';

export const getConversation = async (conversationId: string): Promise<Conversation> => {
  const response = await api.get<ApiResponse<Conversation>>(`/conversations/${conversationId}/`);
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch conversation');
  }
  return response.data;
};

export const getConversationQueryOptions = (conversationId: string) => ({
  queryKey: ['conversations', conversationId],
  queryFn: () => getConversation(conversationId),
});

export const useConversationQuery = (conversationId: string) => {
  return useQuery({
    ...getConversationQueryOptions(conversationId),
    enabled: !!conversationId, // Only run the query if conversationId is not null/undefined
  });
};
