import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Message } from '@/features/message/types/message';
import { getConversationQueryOptions } from '@/features/conversation/api/get-conversation';
import { getMessageQueryOptions } from '@/features/message/api/get-message.ts';

export const createMessageInputSchema = z.object({
  conversation: z.string().uuid().optional(),
  role: z.string().min(1).max(25),
  content: z.string(),
  model: z.string(),
  user: z.string().nullable().optional(),
  image: z.string().optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

export const createMessage = ({ data }: { data: CreateMessageInput }): Promise<Message> => {
  
  return api.post('/chat/', data, {
    responseType: 'stream',
    onDownloadProgress: progressEvent => {
      const chunk = progressEvent.event.target.response;
      if (chunk) {
        window.dispatchEvent(new CustomEvent('message-chunk', { detail: chunk }));
      }
    },
  });
};

type UseCreateMessageOptions = {
  conversation_id: string;
  mutationConfig?: MutationConfig<typeof createMessage>;
};

export const useCreateMessage = ({ conversation_id, mutationConfig }: UseCreateMessageOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getMessageQueryOptions(conversation_id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getConversationQueryOptions(conversation_id).queryKey,
      });
    },
    onMutate: async newMessage => {
      await queryClient.cancelQueries({ queryKey: ['messages', { conversation_id }] });
      queryClient.setQueryData(['messages', { conversation_id }], oldMessages => [
        ...(oldMessages || []),
        { ...newMessage.data, id: String(Date.now()) },
      ]);
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['messages', { conversation_id }], context?.previousMessages);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', { conversation_id }] });
    },
    ...mutationConfig,
    mutationFn: createMessage,
    mutationKey: ['createMessage', conversation_id],
  });
};