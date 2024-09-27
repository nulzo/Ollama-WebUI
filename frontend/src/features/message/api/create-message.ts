import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';

import { getMessageQueryOptions } from '@/features/message/api/get-message.ts';
import { Message } from '@/features/message/types/message';
import { getConversationQueryOptions } from '@/features/conversation/api/get-conversation';

export const createMessageInputSchema = z.object({
  conversation: z.string(),
  role: z.string().min(1).max(25),
  content: z.string(),
  created_at: z.date().nullable().optional(),
  model: z.string().optional(),
  user: z.string().nullable().optional(),
  image: z.string().optional()
});

export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

export const createMessage = ({ data }: { data: CreateMessageInput }): Promise<Message> => {
  return api.post('/chat/ollama/', data, {
    responseType: 'stream',
    onDownloadProgress: (progressEvent) => {
      const chunk = progressEvent.event.target.response;
      // Process the chunk here (e.g., update state with new content)
      if (chunk) {
        // Emit an event with the new chunk
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
        ...oldMessages,
        { ...newMessage.data, id: String(Date.now()) },
      ]);
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['messages', { conversation_id }], context.previousMessages);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', { conversation_id }] });
    },
    ...mutationConfig,
    mutationFn: createMessage,
    mutationKey: ['createMessage', conversation_id],
  });
};
