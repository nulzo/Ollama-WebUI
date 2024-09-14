import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Conversation } from '@/features/conversation/types/conversation';

import { getConversationsQueryOptions } from '@/features/conversation/api/get-conversations';

export const createConversationInputSchema = z.object({
  uuid: z.string().min(1, 'UUID is required and must be unique'),
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
