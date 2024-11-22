import { useEffect, useState } from 'react';
import { Message } from '@/features/message/components/message';
import { StreamingMessage } from '@/features/message/components/streaming-message';
import { useMessages } from '@/features/message/api/get-messages';

interface MessagesListProps {
  conversation_id: string;
  onStreamingUpdate: (content: string) => void;
}

export function MessagesList({ conversation_id, onStreamingUpdate }: MessagesListProps) {
  const { data, isLoading } = useMessages({ conversation_id });
  const [streamContent, setStreamContent] = useState('');
  const [currentModel, setCurrentModel] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const handleMessageChunk = (event: CustomEvent) => {
      const { message } = event.detail;
      if (message?.content) {
        setStreamContent(message.content);
        onStreamingUpdate(message.content);
        setIsStreaming(true);
      }
    };

    const handleMessageDone = () => {
      setStreamContent('');
      setIsStreaming(false);
    };

    window.addEventListener('message-chunk', handleMessageChunk as EventListener);
    window.addEventListener('message-done', handleMessageDone);

    return () => {
      window.removeEventListener('message-chunk', handleMessageChunk as EventListener);
      window.removeEventListener('message-done', handleMessageDone);
    };
  }, [onStreamingUpdate]);

  if (isLoading) return <div>Loading...</div>;

  // Handle the case where data might be wrapped in a json property
  const messages = data?.data || [];
  const messageList = Array.isArray(messages) ? messages : 
                     Array.isArray(messages.json) ? messages.json : [];

  return (
    <div className="flex flex-col gap-4">
      {messageList.map((message) => (
        <Message 
          key={message.id} 
          {...message}
          username={message.user || message.model || 'Assistant'}
          time={new Date(message.created_at).getTime()}
          isTyping={false}
          conversation_id={conversation_id}
        />
      ))}
      {isStreaming && streamContent && (
        <StreamingMessage
          content={streamContent}
          model={currentModel}
          conversation_id={conversation_id}
        />
      )}
    </div>
  );
}