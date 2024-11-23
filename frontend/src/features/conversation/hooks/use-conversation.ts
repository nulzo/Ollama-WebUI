import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useMessages } from '@/features/message/api/get-messages';
import { useCreateMessage, CreateMessageInput } from '@/features/message/api/create-message';
import { useModelStore } from '@/features/models/store/model-store';
import { useUser } from '@/lib/auth';


export function useConversation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const { model } = useModelStore(state => ({ model: state.model }));
  const [streamingContent, _] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  const messages = useMessages({
    conversation_id: searchParamString ?? '',
  });

  const { mutateAsync: createMessageMutation } = useCreateMessage({
    conversation_id: searchParamString ?? '',
    mutationConfig: {
      onMutate: async (variables) => {
        setIsStreaming(true);

        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: ['messages', { conversation_id: searchParamString }]
        });

        // Snapshot the current messages
        const previousMessages = queryClient.getQueryData([
          'messages',
          { conversation_id: searchParamString }
        ]);

        // Optimistically update the messages cache
        queryClient.setQueryData(
          ['messages', { conversation_id: searchParamString }],
          (old: any) => {
            // Handle the case where old might be undefined
            if (!old) return { data: [] };

            // Ensure we're working with the correct data structure
            const existingMessages = Array.isArray(old) ? old :
              Array.isArray(old.data) ? old.data :
                [];

            const newMessage = {
              ...variables.data,
              id: `temp-${Date.now()}`,
              created_at: new Date().toISOString(),
            };

            // If the old data was an array, return an array
            if (Array.isArray(old)) {
              return [...existingMessages, newMessage];
            }

            // Otherwise, maintain the original structure
            return {
              ...old,
              data: [...existingMessages, newMessage]
            };
          }
        );

        return { previousMessages };
      },
      onError: (err, variables, context) => {
        if (context?.previousMessages) {
          queryClient.setQueryData(
            ['messages', { conversation_id: searchParamString }],
            context.previousMessages
          );
        }
        setIsStreaming(false);
      },
    },
  });

  useEffect(() => {
    const handleConversationCreated = (event: CustomEvent) => {
      const uuid = event.detail.uuid;
      setSearchParams({ c: uuid }, { replace: true });

      queryClient.invalidateQueries({
        queryKey: ['conversations'],
        refetchType: 'none'
      });
      queryClient.invalidateQueries({
        queryKey: ['messages', { conversation_id: uuid }], // Update this to be specific
        refetchType: 'none'
      });
    };

    const handleMessageDone = () => {
      setIsStreaming(false);

      // Update this to use the specific conversation ID
      queryClient.invalidateQueries({
        queryKey: ['messages', { conversation_id: searchParamString }],
        refetchType: 'none'
      });
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
        refetchType: 'none'
      });
    };

    window.addEventListener('conversation-created', handleConversationCreated as EventListener);
    window.addEventListener('message-done', handleMessageDone);

    return () => {
      window.removeEventListener('conversation-created', handleConversationCreated as EventListener);
      window.removeEventListener('message-done', handleMessageDone);
    };
  }, [queryClient, setSearchParams, searchParamString]);

  const submitMessage = async (message: string, images: string[] = []): Promise<void> => {
    if (!message.trim()) return;

    try {
      const data: CreateMessageInput = {
        role: 'user',
        content: message,
        model: model?.name || 'llama3.2:3b',
        user: user?.username || 'supatest',
        images: images || [],
        conversation: searchParamString || null,
      };

      await createMessageMutation({ data, queryClient });
    } catch (error) {
      console.error('Error submitting message:', error);
      setIsStreaming(false);
      throw error;
    }
  };

  return {
    conversationId: searchParamString,
    messages,
    submitMessage,
    setSearchParams,
    streamingContent,
    isStreaming,
  };
}