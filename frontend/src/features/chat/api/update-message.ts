import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Message } from '@/features/chat/types/message';
import { getMessagesQueryOptions } from '@/features/chat/api/get-messages';

export const updateMessageInputSchema = z.object({
  content: z.string().nullable().optional(),
  is_liked: z.boolean().nullable().optional(),
  is_hidden: z.boolean().nullable().optional(),
  role: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
});

export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;

export const updateMessage = ({
  data,
  messageId,
}: {
  data: UpdateMessageInput;
  messageId: string;
}): Promise<Message> => {
  // Transform camelCase to snake_case
  const transformedData = {
    content: data.content,
    is_liked: data.is_liked,
    is_hidden: data.is_hidden,
    role: data.role,
    model: data.model,
  };

  return api.patch(`/messages/${messageId}/`, transformedData);
};

type UseUpdateMessageOptions = {
  mutationConfig?: MutationConfig<typeof updateMessage>;
};

export const useUpdateMessage = ({ mutationConfig }: UseUpdateMessageOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateMessage,
  });
};