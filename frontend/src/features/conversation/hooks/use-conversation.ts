import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useCreateConversation } from '@/features/conversation/api/create-conversation';
import { useMessages } from '@/features/message/api/get-messages';
import { useCreateMessage, CreateMessageInput, CreateMessageResponse } from '@/features/message/api/create-message';
import { useModelStore } from '@/features/models/store/model-store';
import { useUser } from '@/lib/auth';

export function useConversation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const queryClient = useQueryClient();
  const { mutateAsync: createConversation } = useCreateConversation();
  const { model } = useModelStore(state => ({ model: state.model }));
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { data: user } = useUser();

  const messages = useMessages({
    conversation_id: searchParamString ?? '',
  });

  const { mutateAsync: createMessageMutation } = useCreateMessage({
    conversation_id: searchParamString,
    mutationConfig: {
      onSuccess: (data: CreateMessageResponse) => {
        if (data) {
          queryClient.invalidateQueries(['messages', { conversation_id: data.conversation_uuid }]);
          queryClient.invalidateQueries(['conversation', data.conversation_uuid]);
          setStreamingContent('');
          setIsStreaming(false);
        }
      },
    },
  });

  const submitMessage = async (message: string, image: string | null = null): Promise<string | undefined> => {
    if (message.trim()) {
      try {
        setIsStreaming(true);
        const data: CreateMessageInput = {
          role: 'user',
          content: message,
          model: model?.name || 'llama3.2:3b',
          user: user?.username || 'supatest',
          image: image,
          conversation: searchParamString || null,
        };
  
        const response = await createMessageMutation({ data });
  
        if (response && response.conversation_uuid) {
          const newConversationUuid = response.conversation_uuid;
          
          if (newConversationUuid !== searchParamString) {
            setSearchParams(`c=${newConversationUuid}`);
          }
  
          return newConversationUuid;
        } else {
          console.error('Unexpected response format:', response);
          throw new Error('Unexpected response format from server');
        }
      } catch (error) {
        console.error('Error submitting message:', error);
        throw error;
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
      }
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