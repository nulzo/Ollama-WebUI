import { useEffect, useState } from 'react';
import { Message } from '@/features/message/components/message';
import { StreamingMessage } from '@/features/message/components/streaming-message';
import { useMessages } from '@/features/message/api/get-messages';
import { Skeleton } from '@/components/ui/skeleton';
import { useMessage } from '../api/get-message';

interface MessagesListProps {
  conversation_id: string;
  onStreamingUpdate: (content: string) => void;
}

interface MessageItemProps {
  id: string;
  role: string;
  conversation_id: string;
  created_at: string;
}

function MessageItem({ id, role, conversation_id, created_at }: MessageItemProps) {
  console.log('MessageItem props:', { id, role, conversation_id }); // Debug log

  const { data: messageData, isLoading, error } = useMessage({ 
    message_id: id,
  });

  console.log('MessageItem query result:', { 
    messageData, 
    isLoading, 
    error,
    id,
    role,
    conversation_id,
    created_at
  }); 

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-1 my-0 py-0 pl-6 font-semibold leading-none">
          {role !== 'user' ? (
            <div className="text-muted-foreground text-sm ps-11">
              <Skeleton className="w-24 h-4" />
            </div>
          ) : (
            <div className="flex justify-end w-full text-muted-foreground text-sm">
              <Skeleton className="w-16 h-4" />
            </div>
          )}
        </div>
        <div className={`flex place-items-start ${role !== 'user' ? 'justify-start' : 'justify-end ps-[25%]'}`}>
          {role !== 'user' && (
            <div className="flex items-center mb-2 font-bold pe-2">
              <Skeleton className="rounded-full w-8 h-8" />
            </div>
          )}
          <div className={role !== 'user' ? 'w-[75%]' : ''}>
            <div className={`px-4 py-3 ${
              role !== 'user'
                ? 'rounded-e-xl rounded-b-xl bg-secondary/50'
                : 'bg-primary/25 rounded-s-xl rounded-b-xl'
            }`}>
              <Skeleton className="w-full h-16" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !messageData) {
    console.error('Message error:', error);
    return null;
  }

  const message = messageData;

  return (
    <Message
      {...message}
      username={message.user || message.model || 'Assistant'}
      time={new Date(created_at).getTime()}
      isTyping={false}
      conversation_id={conversation_id}
      modelName={message.model || 'Assistant'}
      isLoading={false}
    />
  );
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

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  const messageList = data?.results || [];

  console.log('MessageList data:', data);
  
  return (
    <div className="flex flex-col gap-4">
      {messageList.map((message) => (
        <MessageItem
          key={message.id}
          id={message.id}
          role={message.role}
          conversation_id={conversation_id}
          created_at={message.created_at}
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

function LoadingSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          <MessageItem
            id=""
            role={index % 2 === 0 ? 'assistant' : 'user'}
            conversation_id=""
            created_at=""
          />
        </div>
      ))}
    </div>
  );
}