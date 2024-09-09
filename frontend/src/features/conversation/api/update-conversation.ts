import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { getConversationsQueryOptions } from '@/features/conversation/api/get-conversations';
import { Conversation } from '@/features/conversation/types/conversation';

export const updateConversationInputSchema = z.object({
  createdAt: z.date().nullable().optional(),
  isPinned: z.boolean().nullable().optional(),
  isHidden: z.boolean().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
  uuid: z.string().min(1, 'UUID is required and must be unique'),
  name: z.string().max(150).nullable().optional(),
  userId: z.number().nullable().optional(),
});

export type updateConversationInput = z.infer<typeof updateConversationInputSchema>;

export const updateConversation = ({
  data,
  conversationID,
}: {
  data: updateConversationInput;
  conversationID: string;
}): Promise<Conversation> => {
  return api.patch(`/conversations/${conversationID}`, data);
};

type UseUpdateConversationOptions = {
  mutationConfig?: MutationConfig<typeof updateConversation>;
};

export const useConversationDiscussion = ({
  mutationConfig,
}: UseUpdateConversationOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getConversationsQueryOptions(data.uuid).queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateConversation,
  });
};
