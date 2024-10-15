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

  const createMessage = useCreateMessage({
    conversation_id: searchParamString,
    mutationConfig: {
      onSuccess: (data: CreateMessageResponse) => {
        queryClient.invalidateQueries(['messages', { conversation_id: searchParamString }]);
        queryClient.invalidateQueries(['conversation', searchParamString]);
        if (data.uuid) {
          // A new conversation was created
          setSearchParams(`c=${data.uuid}`);
        }
        setStreamingContent('');
        setIsStreaming(false);
      },
    },
  });

  const createNewConversation = async (): Promise<string> => {
    const response = await createConversation({ data: { user: user.id } });
    const newUuid = response.uuid;
    return newUuid;
  };

  const submitMessage = async (message: string, image: string | null = null) => {
    if (message.trim()) {
      try {
        setIsStreaming(true);
        const data: CreateMessageInput = {
          role: 'user',
          content: message,
          model: model?.name || 'llama3.2:3b',
          user: user.username || 'supatest', // Ensure 'user' has 'username'
          image: image,
          conversation: searchParamString,
        };

        if (searchParamString) {
          data.conversation = searchParamString;
        }

        await createMessage.mutateAsync({ data });
      } catch (error) {
        console.error('Error submitting message:', error);
        // Optionally, trigger a notification or handle the error
      }
    }
  };

  return {
    conversationId: searchParamString,
    messages,
    createNewConversation,
    submitMessage,
    setSearchParams,
    streamingContent,
    isStreaming,
  };
}