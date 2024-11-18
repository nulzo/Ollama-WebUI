import { Spinner } from '@/components/ui/spinner';
import { useMessages } from '@/features/message/api/get-messages';
import Message from '@/features/message/components/message';
import { useMutationState, useQueryClient } from '@tanstack/react-query';
import { useModelStore } from '@/features/models/store/model-store';
import { CreateMessageInput } from '../api/create-message';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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

  const smoothScrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end'
      });
    }
  };

  useEffect(() => {
    let rafId: number;
    
    const handleMessageChunk = (event: CustomEvent) => {
      const chunk = event.detail;
      let newContent = '';
      
      if (chunk.delta?.content) {
        newContent = chunk.delta.content;
      } else if (chunk.message?.content) {
        newContent = chunk.message.content;
      }

      if (chunk.conversation_uuid) {
        navigate(`/?c=${chunk.conversation_uuid}`, { replace: true });
        return;
      }

      streamingMessageRef.current += newContent;
      setStreamingContent(streamingMessageRef.current);
      onStreamingUpdate?.(streamingMessageRef.current);
      setIsStreaming(true);

      // Use requestAnimationFrame for smoother scrolling
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(smoothScrollToBottom);
    };

    const handleMessageDone = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
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
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      streamingMessageRef.current = '';
    };
  }, [onStreamingUpdate]);

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

  const confirmedMessages = messagesResponse || [];
  
  const allMessages = [
    ...confirmedMessages,
    ...pendingMessages.filter(pendingMsg => 
      pendingMsg.role === 'user' && 
      pendingMsg.conversation === conversation_id && // Add this condition
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

  return (
    <div className="flex flex-col space-y-4 pb-4">
      {displayMessages.map((message, index) => (
        <Message
          key={message.id || `${message.role}-${index}`}
          {...message}
          isTyping={message.id === 'streaming'}
        />
      ))}
      <div ref={scrollRef} style={{ height: 0 }} />
    </div>
  );
};