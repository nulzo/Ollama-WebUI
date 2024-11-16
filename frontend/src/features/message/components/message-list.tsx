import { Spinner } from '@/components/ui/spinner';
import { useMessages } from '@/features/message/api/get-messages';
import Message from '@/features/message/components/message';
import { useMutationState } from '@tanstack/react-query';
import { useModelStore } from '@/features/models/store/model-store';
import { TypingIndicator } from './typing-indicator';
import { CreateMessageInput } from '../api/create-message';
import { useEffect } from 'react';
import { useState } from 'react';

interface MessagesListProps {
  conversation_id: string;
}

export const MessagesList = ({ conversation_id }: MessagesListProps) => {
  const { data: messagesResponse, isLoading } = useMessages({ conversation_id });
  const { model } = useModelStore(state => ({ model: state.model }));
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const handleMessageChunk = (event: CustomEvent) => {
      const chunk = event.detail;
      setStreamingContent(prev => prev + (chunk.message?.content || ''));
      setIsStreaming(true);
    };

    const handleMessageDone = () => {
      setStreamingContent('');
      setIsStreaming(false);
    };

    window.addEventListener('message-chunk', handleMessageChunk as EventListener);
    window.addEventListener('message-done', handleMessageDone);

    return () => {
      window.removeEventListener('message-chunk', handleMessageChunk as EventListener);
      window.removeEventListener('message-done', handleMessageDone);
    };
  }, []);

  const pendingMessages = useMutationState({
    filters: { mutationKey: ['createMessage', conversation_id], status: 'pending' },
    select: mutation => mutation.state.variables as CreateMessageInput,
  });

  const isTyping = pendingMessages?.length > 0;

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Use messagesResponse directly since it's already an array
  const confirmedMessages = messagesResponse || [];

  const allMessages = [
    ...confirmedMessages,
    ...pendingMessages.filter(
      pendingMsg =>
        pendingMsg.role === 'user' &&
        !confirmedMessages.some(
          confirmedMsg =>
            confirmedMsg.content === pendingMsg.content && 
            confirmedMsg.role === pendingMsg.role
        )
    ),
  ];

  return (
    <div className="flex flex-col space-y-4 pb-4">
      {allMessages.map((message, index) => (
        <Message
          key={`message-${message.id || index}`}
          {...message}
          content={message.content + (isStreaming && index === allMessages.length - 1 ? streamingContent : '')}
          isTyping={isStreaming && index === allMessages.length - 1}
        />
      ))}
    </div>
  );
};