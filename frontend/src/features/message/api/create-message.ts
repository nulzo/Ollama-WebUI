import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Message } from '@/features/message/types/message';
import { getConversationQueryOptions } from '@/features/conversation/api/get-conversation';
import { getConversationsQueryOptions } from '@/features/conversation/api/get-conversations';

export const createMessageInputSchema = z.object({
  conversation_uuid: z.string().uuid().optional(),
  role: z.string().min(1).max(25),
  content: z.string(),
  model: z.string(),
  user: z.string().nullable().optional(),
  image: z.string().optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

export const createMessage = ({ data }: { data: CreateMessageInput }): Promise<Message> => {
  return api.post('/chat/ollama/', data, {
    responseType: 'stream',
    onDownloadProgress: progressEvent => {
      const chunk = progressEvent.event.target?.response;
      if (chunk) {
        window.dispatchEvent(new CustomEvent('message-chunk', { detail: chunk }));
      }
    },
  }).then(response => response.data);
};

type UseCreateMessageOptions = {
  conversation_uuid?: string;
  mutationConfig?: MutationConfig<typeof createMessage>;
};

export const useCreateMessage = ({ conversation_uuid, mutationConfig }: UseCreateMessageOptions) => {
  const queryClient = useQueryClient();

  return useMutation<Message, Error, { data: CreateMessageInput }>({
    mutationFn: createMessage,
    onSuccess: (data, variables) => {
      const newConversationUuid = data.conversation_id || conversation_uuid;
      
      if (newConversationUuid !== conversation_uuid) {
        // A new conversation was created
        queryClient.invalidateQueries(getConversationsQueryOptions().queryKey);
      }

      // Invalidate and refetch messages and conversation data
      queryClient.invalidateQueries(['messages', { conversation_uuid: newConversationUuid }]);
      queryClient.invalidateQueries(['conversation', newConversationUuid]);

      mutationConfig?.onSuccess?.(data, variables, newConversationUuid);
    },
    onMutate: async (newMessage) => {
      const conversationKey = ['messages', { conversation_uuid: conversation_uuid || 'new' }];
      await queryClient.cancelQueries(conversationKey);

      const previousMessages = queryClient.getQueryData<Message[]>(conversationKey);

      queryClient.setQueryData<Message[]>(conversationKey, old => [
        ...(old || []),
        {
          id: Date.now(),
          conversation_uuid: conversation_uuid || 'new',
          role: newMessage.data.role,
          content: newMessage.data.content,
          created_at: new Date().toISOString(),
          model: newMessage.data.model,
          user: newMessage.data.user,
          image: newMessage.data.image,
        },
      ]);

      return { previousMessages };
    },
    onError: (_, __, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', { conversation_uuid: conversation_uuid || 'new' }], context.previousMessages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['messages', { conversation_uuid: conversation_uuid || 'new' }]);
    },
  });
};