import { Message } from './message.tsx';
import { useMessages } from '../api/get-messages.ts';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useConversation } from '../hooks/use-conversation.ts';
import useScrollToEnd from '@/hooks/use-scroll-to-end.ts';

interface MessagesListProps {
  conversation_id: string;
  streamingContent: string;
  isStreaming: boolean;
  isMessageCancelled?: (content: string) => boolean;
  formatMessageContent?: (content: string) => string;
}

export function MessagesList({
  conversation_id,
  streamingContent,
  isStreaming,
  isMessageCancelled = (content: string) => false,
  formatMessageContent = (content: string) => content,
}: MessagesListProps) {
  const {
    messages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useMessages({ conversation_id });
  const { localMessages, isStreaming: isStreamingLocal, assistantMessage } = useConversation();
  
  
  const allMessages = [...(messages || []), ...localMessages];
  const messagesEndRef = useScrollToEnd(allMessages, streamingContent);
  
  const observer = useRef<IntersectionObserver>();
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
     <div className="flex-1 space-y-4 p-4">
       {isFetchingNextPage && <div>Loading...</div>}
       <div ref={loadMoreRef} />
       
       {allMessages.map(message => {
         const messageContent = message.data.content || '';
         const isCancelled = isMessageCancelled(messageContent);
         const formattedContent = formatMessageContent(messageContent);
         
         return (
           <Message
             key={message.data.id}
             {...message.data}
             content={formattedContent}
             conversation_id={conversation_id}
             modelName={message.data.model}
             time={new Date(message.data.created_at).getTime()}
             username={message.data.role === 'user' ? 'User' : 'Assistant'}
             isCancelled={isCancelled}
           />
         );
       })}
        <div ref={messagesEndRef} />
     </div>
   </div>
  );
}
