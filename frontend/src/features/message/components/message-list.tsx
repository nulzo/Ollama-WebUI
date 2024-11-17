import { Spinner } from '@/components/ui/spinner';
import { useMessages } from '@/features/message/api/get-messages';
import Message from '@/features/message/components/message';
import { useMutationState } from '@tanstack/react-query';
import { useModelStore } from '@/features/models/store/model-store';
import { CreateMessageInput } from '../api/create-message';
import { useEffect, useState, useRef } from 'react';

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

  useEffect(() => {
    const handleMessageChunk = (event: CustomEvent) => {
      const chunk = event.detail;
      let newContent = '';
      
      // Handle both OpenAI and Ollama streaming formats
      if (chunk.delta?.content) {
        newContent = chunk.delta.content;
      } else if (chunk.message?.content) {
        newContent = chunk.message.content;
      }

      // Update the ref immediately for smooth streaming
      streamingMessageRef.current += newContent;
      
      // Update state (this will trigger a re-render)
      setStreamingContent(streamingMessageRef.current);
      onStreamingUpdate?.(streamingMessageRef.current);
      setIsStreaming(true);
    };

    const handleMessageDone = () => {
      setIsStreaming(false);
      // Reset the ref and state after a small delay
      setTimeout(() => {
        streamingMessageRef.current = '';
        setStreamingContent('');
        onStreamingUpdate?.('');
      }, 100);
    };

    window.addEventListener('message-chunk', handleMessageChunk as EventListener);
    window.addEventListener('message-done', handleMessageDone);

    return () => {
      window.removeEventListener('message-chunk', handleMessageChunk as EventListener);
      window.removeEventListener('message-done', handleMessageDone);
      // Clean up ref on unmount
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
      !confirmedMessages.some(confirmedMsg => 
        confirmedMsg.content === pendingMsg.content && 
        confirmedMsg.role === pendingMsg.role
      )
    ),
  ];

  // Add streaming message if we're currently streaming
  const displayMessages = isStreaming ? [
    ...allMessages,
    {
      id: 'streaming',
      role: 'assistant',
      content: streamingContent,
      model: model?.name || '',
      user: null,
      time: Date.now(),
      isTyping: true,
      username: model?.name || 'Assistant' // Add username for the Message component
    }
  ] : allMessages;

  return (
    <div className="flex flex-col space-y-4 pb-4">
      {displayMessages.map((message, index) => (
        <Message
          key={`message-${message.id || index}`}
          {...message}
          isTyping={message.id === 'streaming'}
        />
      ))}
    </div>
  );
};