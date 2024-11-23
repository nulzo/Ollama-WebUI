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
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ['messages']
        });
        queryClient.invalidateQueries({
          queryKey: ['conversations']
        });
      },
    },
  });

  useEffect(() => {
    const handleConversationCreated = (event: CustomEvent) => {
      const uuid = event.detail.uuid;
      // First update the URL
      setSearchParams({ c: uuid }, { replace: true });
      
      // Then update the queries, but don't force a refetch
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
        refetchType: 'none' // Don't immediately refetch
      });
      queryClient.invalidateQueries({
        queryKey: ['messages'],
        refetchType: 'none' // Don't immediately refetch
      });
    };

    const handleMessageDone = () => {
      setIsStreaming(false);
      
      // Use background refetch to avoid UI flicker
      queryClient.invalidateQueries({
        queryKey: ['messages'],
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
  }, [queryClient, setSearchParams]);

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

      queryClient.setQueryData(['messages', { conversation_id: searchParamString }], (old: any) => ({
        ...old,
        data: [...(old?.data || []), { ...data, id: Date.now() }],
      }));

      await createMessageMutation({ data, queryClient });

      // Add event listener for message completion
      const handleMessageDone = () => {
        setIsStreaming(false);
        // Force refetch messages after streaming is done
        queryClient.invalidateQueries({
          queryKey: ['messages', { conversation_id: searchParamString }]
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