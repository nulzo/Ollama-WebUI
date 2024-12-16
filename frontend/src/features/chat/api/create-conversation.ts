import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client.ts';
import { MutationConfig } from '@/lib/query.ts';
import { Conversation } from '@/features/chat/types/conversation';

import { getConversationsQueryOptions } from '@/features/chat/api/get-conversations.ts';

export const createConversationInputSchema = z.object({
  name: z.string().max(150).nullable().optional(),
  user: z.number(),
});

export type CreateConversationInput = z.infer<typeof createConversationInputSchema>;

export const createConversation = ({
  data,
}: {
  data: CreateConversationInput;
}): Promise<Conversation> => {
  return api.post(`/conversations/`, data);
};

type UseCreateConversationOptions = {
  mutationConfig?: MutationConfig<typeof createConversation>;
};

export const useCreateConversation = ({ mutationConfig }: UseCreateConversationOptions = {}) => {
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
    mutationFn: createConversation,
  });
};
