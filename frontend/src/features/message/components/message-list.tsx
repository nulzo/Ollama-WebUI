import { Spinner } from '@/components/ui/spinner';
import { useMessages } from '@/features/message/api/get-messages';
import Message from '@/features/message/components/message';
import { useMutationState, useQueryClient } from '@tanstack/react-query';
import { useModelStore } from '@/features/models/store/model-store';
import { CreateMessageInput } from '../api/create-message';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useScrollToEnd from '@/hooks/use-scroll-to-end';
import { StreamingMessage } from './streaming-message';

interface MessagesListProps {
  conversation_id: string;
  onStreamingUpdate?: (content: string) => void;
}

export const MessagesList = ({ conversation_id, onStreamingUpdate }: MessagesListProps) => {
  const { data: messagesResponse, isLoading } = useMessages({ conversation_id });
  const { model } = useModelStore(state => ({ model: state.model }));
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingMessageRef = useRef('');
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const pendingMessages = useMutationState({
    filters: { mutationKey: ['createMessage', conversation_id], status: 'pending' },
    select: mutation => mutation.state.variables as CreateMessageInput,
  });

  const confirmedMessages = messagesResponse ? 
    [...Object.values(messagesResponse)
      .filter(value => typeof value === 'object' && !Array.isArray(value)), 
     ...(messagesResponse.data || [])]
    .filter(msg => msg.id && msg.role && msg.content) : [];

  const allMessages = [
    ...confirmedMessages,
    ...pendingMessages.filter(pendingMsg => 
      pendingMsg.role === 'user' && 
      pendingMsg.conversation === conversation_id &&
      !confirmedMessages.some(confirmedMsg => 
        confirmedMsg.content === pendingMsg.content && 
        confirmedMsg.role === pendingMsg.role
      )
    ),
  ];

  const displayMessages = [
    ...allMessages,
    ...(isStreaming ? [{
      id: 'streaming',
      role: 'assistant',
      content: streamingContent,
      model: model?.name || '',
      user: null,
      conversation_id: conversation_id, // Add this
      time: Date.now(),
      isTyping: true,
      username: model?.name || 'Assistant'
    }] : [])
  ];

  // const memoizedStaticMessages = useMemo(() => staticMessages, [staticMessages]);

  // Add scroll handler
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    window.addEventListener('scroll-to-bottom', scrollToBottom);

    // Scroll on initial load
    scrollToBottom();

    return () => {
      window.removeEventListener('scroll-to-bottom', scrollToBottom);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }


  return (
    <div className="flex flex-col space-y-4 pb-4">
      {displayMessages.map((message, index) => (
        <Message
          key={message.id || `${message.role}-${index}`}
          {...message}
          isTyping={message.id === 'streaming'}
        />
      ))}
      <div ref={messagesEndRef} style={{ height: 0 }} />
    </div>
  );
};