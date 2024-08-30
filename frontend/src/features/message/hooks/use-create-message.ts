import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { MutationConfig } from '@/lib/query';
import { Comment } from '@/types/api';

import { getMessages } from './use-get-messages';
import { messageService } from '@/services/storage/client';

export const createMessageSchema = z.object({
  conversation: z.string().min(1, 'Required'),
  content: z.string().min(1, 'Required'),
  model: z.string().min(1, 'Required'),
  role: z.string().min(1, 'Required'),
  is_liked: z.boolean().optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export const createMessage = ({data}: {data: CreateMessageInput}): Promise<Comment> => {
  return messageService.createMessage(data);
};

type UseCreateCommentOptions = {
  conversation: string;
  mutationConfig?: MutationConfig<typeof createMessage>;
};

export const useCreateMessage = ({
  mutationConfig,
  conversation,
}: UseCreateCommentOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getMessages(conversation).queryKey,
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createMessage,
  });
};
