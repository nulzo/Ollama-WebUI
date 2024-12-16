import { Message } from './message.tsx';
import { useMessages } from '../api/get-messages.ts';
import { StreamingMessage } from './streaming-message.tsx';
import useScrollToEnd from '@/hooks/use-scroll-to-end.ts';
import { Skeleton } from '@/components/ui/skeleton.tsx';

interface MessagesListProps {
  conversation_id: string;
  streamingContent: string;
  isStreaming: boolean;
}

export function MessagesList({
  conversation_id,
  streamingContent,
  isStreaming,
}: MessagesListProps) {
  const { data, isLoading } = useMessages({ conversation_id });
  const ref = useScrollToEnd(data?.results ?? [], streamingContent);

  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  const messages = data?.results || [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 justify-end min-h-full">
        <div className="flex flex-col gap-4">
          {messages.map(message => (
            <Message
              key={message.conversation_uuid}
              {...message}
              conversation_id={conversation_id}
            />
          ))}
          {isStreaming && streamingContent && (
            <StreamingMessage
              content={streamingContent}
              conversation_id={conversation_id}
              model="i don't know"
            />
          )}
        </div>
        <div ref={ref} className="h-0" />
      </div>
    </div>
  );
}
