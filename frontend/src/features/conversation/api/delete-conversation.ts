import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';

import { getConversationsQueryOptions } from '@/features/conversation/api/get-conversations';

export const deleteConversation = ({ conversationID }: { conversationID: string }) => {
  return api.delete(`/conversations/${conversationID}/`);
};

type UseDeleteConversationOptions = {
  mutationConfig?: MutationConfig<typeof deleteConversation>;
};

export const useDeleteConversation = ({ mutationConfig }: UseDeleteConversationOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getConversationsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getConversationsQueryOptions().queryKey,
      });
    },
    ...restConfig,
    mutationFn: deleteConversation,
  });
};
