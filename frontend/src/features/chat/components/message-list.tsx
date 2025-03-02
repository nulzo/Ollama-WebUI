import { Message } from './message';
import { useMessages } from '../api/get-messages';
import { Skeleton } from '@/components/ui/skeleton';
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useConversation } from '../hooks/use-conversation';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import type { ListChildComponentProps } from 'react-window';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface MessagesListProps {
  conversation_id: string;
  streamingContent: string;
  isStreaming: boolean;
  isMessageCancelled?: (content: string) => boolean;
  formatMessageContent?: (content: string) => string;
}

interface MessageRowData {
  messages: any[];
  conversation_id: string;
  isMessageCancelled: (content: string) => boolean;
  formatMessageContent: (content: string) => string;
  isStreaming: boolean;
}

// Scroll to bottom button component
const ScrollToBottomButton = ({ onClick, isVisible }: { onClick: () => void; isVisible: boolean }) => {
  if (!isVisible) return null;
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className="flex items-center gap-1 bg-input border rounded-lg"
      aria-label="Scroll to bottom"
    >
      <span>Scroll to bottom</span>
      <ChevronDown className="w-4 h-4" />
    </Button>
  );
};

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
  
  const { localMessages } = useConversation();
  const listRef = useRef<List>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  // Optimize message combining
  const allMessages = useMemo(() => {
    // Handle null or undefined messages
    const fetchedMessages = messages || [];
    const localMsgs = localMessages || [];
    
    // If one array is empty, return the other without creating a new array
    if (fetchedMessages.length === 0) return localMsgs;
    if (localMsgs.length === 0) return fetchedMessages;
    
    // Only create a new array when necessary
    return [...fetchedMessages, ...localMsgs];
  }, [messages, localMessages]);
  
  // Intersection Observer for infinite loading
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingNextPage) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && listRef.current && allMessages.length > 0) {
      // Use requestAnimationFrame to ensure the DOM is ready
      requestAnimationFrame(() => {
        if (listRef.current) {
          listRef.current.scrollToItem(allMessages.length - 1);
        }
      });
    }
  }, [allMessages.length, streamingContent, shouldAutoScroll]);

  // Update container height when window resizes
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    
    // Initial height calculation
    updateHeight();
    
    // Use ResizeObserver for more efficient size tracking
    const resizeObserver = new ResizeObserver(updateHeight);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, []);

  // Handle scroll events to show/hide scroll button
  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number, scrollDirection: "forward" | "backward" }) => {
    // Show scroll button when not at the bottom
    const isAtBottom = scrollOffset < 100;
    setShowScrollButton(!isAtBottom);
    setShouldAutoScroll(isAtBottom);
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (listRef.current && allMessages.length > 0) {
      listRef.current.scrollToItem(allMessages.length - 1);
      setShouldAutoScroll(true);
    }
  }, [allMessages.length]);

  // Estimate item size (average message height)
  const estimatedItemSize = 120; // Adjust based on your average message height

  // Memoize the item data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    messages: allMessages,
    conversation_id,
    isMessageCancelled,
    formatMessageContent,
    isStreaming
  }), [allMessages, conversation_id, isMessageCancelled, formatMessageContent, isStreaming]);

  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  // If we have no messages, show a placeholder
  if (allMessages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-muted-foreground">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col flex-1 min-h-0" ref={containerRef}>
      <div className="flex-1 p-4">
        {/* Loading indicator for fetching more messages */}
        {isFetchingNextPage && (
          <div className="top-0 right-0 left-0 z-10 absolute flex justify-center py-2">
            <div className="bg-background/80 shadow-md px-4 py-2 rounded-full">
              Loading older messages...
            </div>
          </div>
        )}
        
        {/* Invisible element for intersection observer */}
        <div ref={loadMoreRef} className="w-full h-4" />
        
        {/* Regular Message List (non-virtualized) */}
        <div className="space-y-6">
          {allMessages.map((message: any, index: number) => {
            const messageContent = message.data?.content || message.content || '';
            const isCancelled = isMessageCancelled(messageContent);
            const formattedContent = formatMessageContent(messageContent);
            const isLastMessage = index === allMessages.length - 1;
            
            return (
              <Message
                key={message.data?.id || message.id || `msg-${index}`}
                message={{
                  ...(message.data || message),
                  content: formattedContent,
                  conversation_id,
                  model: message.data?.model || message.model,
                  created_at: message.data?.created_at || message.created_at,
                  role: message.data?.role || message.role,
                }}
                isTyping={isStreaming && isLastMessage && (message.data?.role === 'assistant' || message.role === 'assistant')}
                isCancelled={isCancelled}
              />
            );
          })}
        </div>
      </div>
      
      {/* Scroll to bottom button */}
      <div className="bottom-4 left-1/2 z-10 absolute -translate-x-1/2 pointer-events-auto transform">
        <ScrollToBottomButton 
          isVisible={showScrollButton} 
          onClick={() => {
            if (containerRef.current) {
              containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: 'smooth'
              });
              setShouldAutoScroll(true);
            }
          }} 
        />
      </div>
    </div>
  );
}