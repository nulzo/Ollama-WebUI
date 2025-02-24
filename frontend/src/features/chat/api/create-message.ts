import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api-client.ts';
import { MutationConfig } from '@/lib/query.ts';

export const createMessageInputSchema = z.object({
  conversation: z.string().uuid().optional(),
  role: z.string().min(1).max(25),
  content: z.string(),
  model: z.string(),
  user: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  provider: z.string().optional(),
  name: z.string().optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

export const createMessage = async ({
  data,
  queryClient,
}: {
  data: CreateMessageInput;
  queryClient: QueryClient;
}): Promise<void> => {
  window.dispatchEvent(
    new CustomEvent('message-sent', {
      detail: {
        message: {
          role: data.role,
          content: data.content,
          user: data.user,
          model: data.model,
          created_at: new Date().toISOString(),
          images: data.images,
          provider: data.provider,
          name: data.name,
        },
      },
    })
  );

  try {
    const response = await api.post('/completions/chat', data, {
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      },
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
                queryKey: ['messages'],
              });
              queryClient.invalidateQueries({
                queryKey: ['conversations'],
              });
              return;
            }
            try {
              const parsed = JSON.parse(data);

              // If an error is signaled in the incoming chunk, dispatch an error event.
              if (parsed.status === 'error') {
                // Dispatch a custom event to notify the rest of the app about the error.
                window.dispatchEvent(new CustomEvent('chat-error', { detail: { error: parsed.error } }));
                console.error('Chat error from provider:', parsed.error);
                
                // Signal that message generation is complete (even if with an error),
                // so the UI can re-fetch the message which now includes the error details.
                window.dispatchEvent(new CustomEvent('message-done'));
              
                // Invalidate queries to force a refetch of messages and conversations.
                queryClient.invalidateQueries({ queryKey: ['messages'] });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                return;
              }

              if (parsed.conversation_uuid) {
                window.dispatchEvent(
                  new CustomEvent('conversation-created', {
                    detail: { uuid: parsed.conversation_uuid },
                  })
                );
                continue;
              }
              // Extract content from the OpenAI-style delta format
              const content = parsed.delta?.content || '';
              fullContent += content;

              window.dispatchEvent(
                new CustomEvent('message-chunk', {
                  detail: {
                    message: {
                      role: 'assistant',
                      content: fullContent,
                    },
                  },
                })
              );
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
    onMutate: async variables => {
      await queryClient.cancelQueries({
        queryKey: ['messages', { conversation_id }],
        exact: true,
      });

      const previousMessages = queryClient.getQueryData(['messages', { conversation_id }]);

      // Update cache with new message while preserving existing ones
      queryClient.setQueryData(['messages', { conversation_id }], (old: any) => {
        const existingMessages = old?.data || [];
        return {
          ...old,
          data: [
            ...existingMessages,
            {
              id: `temp-${Date.now()}`,
              role: variables.data.role,
              content: variables.data.content,
              user: variables.data.user,
              model: variables.data.model,
              provider: variables.data.provider,
              created_at: new Date().toISOString(),
              conversation_uuid: conversation_id,
              images: variables.data.images || [],
            },
          ],
        };
      });

      return { previousMessages };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', { conversation_id }], context.previousMessages);
      }
    },
    onSettled: () => {
      // Don't invalidate here
    },
    ...mutationConfig,
    mutationFn: variables => createMessage({ ...variables, queryClient }),
  });
};
