import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
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
  images: z.string().optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

export const createMessage = async ({ 
  data, 
  queryClient
}: { 
  data: CreateMessageInput;
  queryClient: QueryClient;
}): Promise<void> => {
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
              queryClient.invalidateQueries({
                queryKey: ['messages']
              });
              queryClient.invalidateQueries({
                queryKey: ['conversations']
              });
              return;
            }
            try {
              const parsed = JSON.parse(data);

              if (parsed.conversation_uuid) {
                window.dispatchEvent(new CustomEvent('conversation-created', {
                  detail: { uuid: parsed.conversation_uuid }
                }));
                continue;
              }
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
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', { conversation_id }] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['messages', { conversation_id }]);

      // Optimistically update to the new value
      queryClient.setQueryData(['messages', { conversation_id }], (old: any) => {
        const existingMessages = old?.data || [];
        const messageList = Array.isArray(existingMessages) ? existingMessages : 
                          Array.isArray(existingMessages.json) ? existingMessages.json : [];
        
        return {
          ...old,
          data: [...messageList, { 
            id: `temp-${Date.now()}`,
            role: variables.data.role,
            content: variables.data.content,
            user: variables.data.user,
            model: variables.data.model,
            created_at: new Date().toISOString(),
            conversation_uuid: conversation_id,
            images: variables.data.images || []
          }]
        };
      });

      return { previousMessages };
    },

    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', { conversation_id }], context.previousMessages);
      }
    },

    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({
        queryKey: ['messages', { conversation_id }]
      });
    },

    ...mutationConfig,
    mutationFn: (variables) => createMessage({ ...variables, queryClient }),
  });
};