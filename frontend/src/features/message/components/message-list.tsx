import { useEffect, useState } from 'react';
import { Message } from '@/features/message/components/message';
import { StreamingMessage } from '@/features/message/components/streaming-message';
import { useMessages } from '@/features/message/api/get-messages';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Handle the case where data might be wrapped in a json property
  const messages = data?.data || [];
  const messageList = Array.isArray(messages) ? messages :
    Array.isArray(messages.json) ? messages.json : [];


  if (isLoading) {
    // Show skeleton loading state with message headers
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex items-baseline gap-1 my-0 py-0 pl-6 font-semibold leading-none">
              {index % 2 === 0 ? (
                <div className="text-muted-foreground text-sm ps-11">
                  <Skeleton className="w-24 h-4" />
                </div>
              ) : (
                <div className="flex justify-end w-full text-muted-foreground text-sm">
                  <Skeleton className="w-16 h-4" />
                </div>
              )}
            </div>
            <div className={`flex place-items-start ${index % 2 === 0 ? 'justify-start' : 'justify-end ps-[25%]'}`}>
              {index % 2 === 0 && (
                <div className="flex items-center mb-2 font-bold pe-2">
                  <Skeleton className="rounded-full w-8 h-8" />
                </div>
              )}
              <div className={index % 2 === 0 ? 'w-[75%]' : ''}>
                <div className={`px-4 py-3 ${index % 2 === 0
                    ? 'rounded-e-xl rounded-b-xl bg-secondary/50'
                    : 'bg-primary/25 rounded-s-xl rounded-b-xl'
                  }`}>
                  <Skeleton className="w-full h-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
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
          modelName={message.model || 'Assistant'}
          isLoading={isLoading}
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