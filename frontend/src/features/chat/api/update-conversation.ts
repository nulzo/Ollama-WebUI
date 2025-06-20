import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client.ts';
import { MutationConfig } from '@/lib/query.ts';
import { getConversationsQueryOptions } from '@/features/chat/api/get-conversations.ts';
import { getConversationQueryOptions } from './get-conversation.ts';
import { Conversation } from '../types/conversation.ts';

type UpdateConversationDTO = {
  conversationId: string;
  data: Partial<Conversation>;
};

export const updateConversation = ({ conversationId, data }: UpdateConversationDTO) => {
  return api.patch<Conversation>(`/conversations/${conversationId}/`, data);
};

type UseUpdateConversationOptions = {
  mutationConfig?: MutationConfig<typeof updateConversation>;
};

export const useUpdateConversation = ({ mutationConfig }: UseUpdateConversationOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, variables) => {
      // Invalidate both the single conversation and the list
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      if (onSuccess) {
        onSuccess(data, variables, {});
      }
    },
    ...restConfig,
    mutationFn: updateConversation,
  });
};
