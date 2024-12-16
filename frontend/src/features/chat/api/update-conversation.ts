import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client.ts';
import { MutationConfig } from '@/lib/query.ts';
import { getConversationsQueryOptions } from '@/features/chat/api/get-conversations.ts';
import { Conversation } from '@/features/chat/types/conversation';

export const updateConversationInputSchema = z.object({
  createdAt: z.date().nullable().optional(),
  is_pinned: z.boolean().nullable().optional(),
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
  // Transform camelCase to snake_case
  const transformedData = {
    created_at: data.createdAt,
    is_pinned: data.is_pinned,
    is_hidden: data.isHidden,
    updated_at: data.updatedAt,
    name: data.name,
    user_id: data.userId,
  };

  return api.patch(`/conversations/${conversationID}/`, transformedData);
};

type UseUpdateConversationOptions = {
  mutationConfig?: MutationConfig<typeof updateConversation>;
};

export const useUpdateConversation = ({ mutationConfig }: UseUpdateConversationOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getConversationsQueryOptions().queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateConversation,
  });
};
