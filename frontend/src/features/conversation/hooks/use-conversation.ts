import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useMessages } from '@/features/message/api/get-messages';
import { useCreateMessage, CreateMessageInput } from '@/features/message/api/create-message';
import { useModelStore } from '@/features/models/store/model-store';
import { useUser } from '@/lib/auth';
import { useConversation as useGetConversation } from '@/features/conversation/api/get-conversation';


export function useConversation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const { model } = useModelStore(state => ({ model: state.model }));
  const [streamingContent, _] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { data: user } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const conversation = useGetConversation({
    conversation_id: searchParamString ?? ''
  })

  if (conversation.isError) {
    queryClient.removeQueries({
      queryKey: ['conversation', searchParamString]
    });
    navigate('/', { replace: true });
    setSearchParams({}, { replace: true });
  }

  const messages = useMessages({
    conversation_id: searchParamString ?? '',
  });

  const { mutateAsync: createMessageMutation } = useCreateMessage({
    conversation_id: searchParamString ?? '',
    mutationConfig: {
      onMutate: async (variables) => {
        setIsStreaming(true);

        // Create optimistic message
        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          role: variables.data.role,
          content: variables.data.content,
          user: variables.data.user,
          model: variables.data.model,
          created_at: new Date().toISOString(),
          conversation_uuid: searchParamString,
          images: variables.data.images || []
        };

        // Dispatch optimistic message event
        window.dispatchEvent(new CustomEvent('optimistic-message', {
          detail: { message: optimisticMessage }
        }));

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
            if (!old) return { messages: [optimisticMessage] };

            return {
              ...old,
              messages: [...(old.messages || []), optimisticMessage]
            };
          }
        );

        return { previousMessages };
      },
      onError: (err, variables, context) => {
        // Revert optimistic update on error
        if (context?.previousMessages) {
          queryClient.setQueryData(
            ['messages', { conversation_id: searchParamString }],
            context.previousMessages
          );
        }
        setIsStreaming(false);
      },
      onSettled: () => {
        // Invalidate queries after mutation is settled
        queryClient.invalidateQueries({
          queryKey: ['messages', { conversation_id: searchParamString }]
        });
      }
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
        queryKey: ['messages', { conversation_id: uuid }],
        refetchType: 'none'
      });
    };

    const handleMessageDone = () => {
      setIsStreaming(false);

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
      const data = {
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