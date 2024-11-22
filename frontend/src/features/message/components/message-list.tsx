import { Spinner } from '@/components/ui/spinner';
import { useMessages } from '@/features/message/api/get-messages';
import Message from '@/features/message/components/message';
import { useMutationState, useQueryClient } from '@tanstack/react-query';
import { useModelStore } from '@/features/models/store/model-store';
import { CreateMessageInput } from '../api/create-message';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { throttle } from 'lodash';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const ref = useScrollToEnd(messagesResponse?.data ?? [], streamingContent);
  const [estimatedHeight, setEstimatedHeight] = useState(0);

  const throttledUpdate = useRef(throttle((content: string) => {
    setStreamingContent(content);
    if (onStreamingUpdate) {
      onStreamingUpdate(content);
    }
  }, 500));

  const handleMessageChunk = (event: CustomEvent) => {
    const chunk = event.detail.content;
    streamingMessageRef.current += chunk;
    throttledUpdate.current(streamingMessageRef.current);

    const isNearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100;

    if (isNearBottom) {
      smoothScrollToBottom();
    }

    if (event.detail.conversation_uuid) {
      navigate(`/?c=${event.detail.conversation_uuid}`, { replace: true });
      return;
    }
  };

  useEffect(() => {
    const handleMessageDone = () => {

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['messages', { conversation_id: conversation_id }]
        }).then(() => {
          setIsStreaming(false);
          streamingMessageRef.current = '';
          setStreamingContent('');
          onStreamingUpdate?.('');
          // smoothScrollToBottom();
        });
      }, 500);
    };

    window.addEventListener('message-chunk', handleMessageChunk as EventListener);
    window.addEventListener('message-done', handleMessageDone);

    return () => {
      window.removeEventListener('message-chunk', handleMessageChunk as EventListener);
      window.removeEventListener('message-done', handleMessageDone);
    };
  }, []);

  const smoothScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  // const allMessages = isStreaming ? [...messages, {
  //   id: 'streaming',
  //   role: 'assistant',
  //   content: streamingContent,
  // }] : messages;

  useEffect(() => {
    if (streamingContent && scrollRef.current) {
      requestAnimationFrame(smoothScrollToBottom);
    }
  }, [streamingContent]);

  useEffect(() => {
    if (isStreaming) {
      // Estimate 24px per line, assuming average of 80 chars per line
      const estimatedLines = Math.ceil(streamingContent.length / 80);
      setEstimatedHeight(Math.max(100, estimatedLines * 24));
    } else {
      setEstimatedHeight(0);
    }
  }, [streamingContent, isStreaming]);

  const pendingMessages = useMutationState({
    filters: { mutationKey: ['createMessage', conversation_id], status: 'pending' },
    select: mutation => mutation.state.variables as CreateMessageInput,
  });

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

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
      conversation_id: conversation_id,
      time: Date.now(),
      isTyping: true,
      username: model?.name || 'Assistant',
      minHeight: estimatedHeight // Add this property
    }] : [])
  ];

  return (
    <div className="flex flex-col space-y-4 pb-4">
      {displayMessages.map((message, index) => (
        <Message
          key={message.id || `${message.role}-${index}`}
          {...message}
          isTyping={message.id === 'streaming'}
        />
      ))}
      {isStreaming && <StreamingMessage content={streamingContent} model={model?.name || ''} conversation_id={conversation_id} />}
      <div ref={ref} style={{ height: 0 }} />
    </div>
  );
};