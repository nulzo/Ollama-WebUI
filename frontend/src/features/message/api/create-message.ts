import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
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

export const createMessage = async ({ data }: { data: CreateMessageInput }): Promise<void> => {
  try {
    const response = await api.post('/chat/', data, {
      headers: {
        'Accept': 'text/event-stream',
        'Content-Type': 'application/json',
      }
    });

    if (!response) {
      throw new Error('No response from server');
    }

    const reader = response.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      try {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              window.dispatchEvent(new CustomEvent('message-done'));
              return;
            }
            try {
              const parsed = JSON.parse(data);
              // Extract content from the OpenAI-style delta format
              const content = parsed.delta?.content || '';
              fullContent += content;
              
              window.dispatchEvent(new CustomEvent('message-chunk', {
                detail: {
                  message: {
                    role: 'assistant',
                    content: fullContent
                  }
                }
              }));
            } catch (e) {
              console.error('Error parsing chunk:', e, data);
            }
          }
        }
      } catch (error) {
        console.error('Error reading stream:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Full error details:', error);
    throw error;
  }
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