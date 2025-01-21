import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client.ts';
import { MutationConfig } from '@/lib/query.ts';
import { Conversation } from '@/features/chat/types/conversation';

import { getConversationsQueryOptions } from '@/features/chat/api/get-conversations.ts';

export const createAITitle = (data: { conversation_uuid: string }): Promise<Conversation> => {
  return api.post(`/conversations/${data.conversation_uuid}/title/`);
};

type UseCreateAITitleOptions = {
  mutationConfig?: MutationConfig<typeof createAITitle>;
};

export const useCreateAITitle = ({ mutationConfig }: UseCreateAITitleOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getConversationsQueryOptions().queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createAITitle,
  });
};
