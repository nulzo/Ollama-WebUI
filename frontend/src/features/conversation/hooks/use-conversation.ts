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
            const existingMessages = old?.data || [];
            return {
              ...old,
              data: [...existingMessages, {
                ...variables.data,
                id: `temp-${Date.now()}`,
                created_at: new Date().toISOString(),
              }]
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
      onSettled: () => {
        // Don't invalidate here - we'll handle it in the message-done event
      },
    },
  });

  useEffect(() => {
    const handleMessageDone = () => {
      setIsStreaming(false);
      
      // Only refetch messages for the current conversation
      queryClient.invalidateQueries({
        queryKey: ['messages', { conversation_id: searchParamString }],
        refetchType: 'none'
      });
    };

    window.addEventListener('message-done', handleMessageDone);
    return () => {
      window.removeEventListener('message-done', handleMessageDone);
    };
  }, [queryClient, searchParamString]);

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

      const handleMessageDone = () => {
        setIsStreaming(false);
        // Use background refetch
        queryClient.invalidateQueries({
          queryKey: ['messages', { conversation_id: searchParamString }],
          refetchType: 'none'
        });
      };

      window.addEventListener('message-done', handleMessageDone);
      setTimeout(() => {
        window.removeEventListener('message-done', handleMessageDone);
      }, 1000);
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