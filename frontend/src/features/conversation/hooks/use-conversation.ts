import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { useCreateConversation } from '@/features/conversation/api/create-conversation';
import { useMessages } from '@/features/message/api/get-messages';
import { useCreateMessage } from '@/features/message/api/create-message';
import { useModelStore } from '@/features/models/store/model-store';
import { useUser } from '@/lib/auth';


export function useConversation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const queryClient = useQueryClient();
  const createConversation = useCreateConversation();
  const { model } = useModelStore(state => ({ model: state.model }));
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { data: user } = useUser();

  const messages = useMessages({
    conversation_id: searchParamString ?? '',
  });

  const createMessage = useCreateMessage({
    conversation_id: searchParamString ?? '',
    mutationConfig: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['messages', { conversation_id: searchParamString }],
        });
        setStreamingContent('');
        setIsStreaming(false);
      },
    },
  });

  const createNewConversation = () => {
    const newUuid = uuidv4();
    createConversation.mutate({
      data: {
        uuid: newUuid,
        user: 1,
      },
    });
    setSearchParams(`c=${newUuid}`);
  };

  const submitMessage = (message: string, image: string | null = null) => {
    if (message.trim()) {
      createMessage.mutate({
        data: {
          conversation: searchParamString ?? '',
          role: 'user',
          content: message,
          model: model?.name,
          user: user[0].username,
          image: image,
        },
      });
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
