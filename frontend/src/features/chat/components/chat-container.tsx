import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Message } from './message';
import { useMessages } from '../api/get-messages';
import { useChatMutation } from '../hooks/use-chat-mutation';
import { useChatStore } from '../stores/chat-store';
import { Button } from '@/components/ui/button';
import { ChevronDown, Loader2, X } from 'lucide-react';
import { throttle } from '@/utils/throttle';

interface ScrollToBottomButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  onClick,
  isVisible,
}) => {
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

interface CancelButtonProps {
  onClick: () => void;
}

export const CancelButton: React.FC<CancelButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant="destructive"
      className="flex items-center gap-2 shadow-lg"
      aria-label="Cancel generation"
    >
      <X className="w-4 h-4" />
      <span>Stop generating</span>
    </Button>
  );
};

export function ChatContainer({ conversation_id }: { conversation_id: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const previousConversationIdRef = useRef<string | null>(null);

  const { handleCancel } = useChatMutation(conversation_id);
  const { messages, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages({
    conversation_id,
  });
  const { 
    streamingMessages, 
    isGenerating, 
    isWaiting,
    currentConversationId,
    setCurrentConversationId
  } = useChatStore();

  // Update current conversation ID when the component mounts or conversation_id changes
  useEffect(() => {
    if (conversation_id && conversation_id !== currentConversationId) {
      setCurrentConversationId(conversation_id);
      
      // Force scroll to bottom when changing conversations
      setShouldAutoScroll(true);
      
      // Remember the previous conversation ID
      previousConversationIdRef.current = currentConversationId;
    }
  }, [conversation_id, currentConversationId, setCurrentConversationId]);

  // Filter streaming messages to only show those for the current conversation
  const currentStreamingMessages = useMemo(() => {
    return streamingMessages.filter(msg => msg.conversation_uuid === conversation_id);
  }, [streamingMessages, conversation_id]);

  // Combine existing messages and any streaming updates for the current conversation
  const allMessages = useMemo(() => {
    return [...messages, ...currentStreamingMessages];
  }, [messages, currentStreamingMessages]);

  // Whenever messages or streaming updates change, scroll to the bottom if the user hasn't scrolled up
  useEffect(() => {
    if (
      shouldAutoScroll &&
      containerRef.current &&
      (currentStreamingMessages.length > 0 || isGenerating)
    ) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [allMessages, shouldAutoScroll, isGenerating, currentStreamingMessages.length]);

  // Clean up messages when component mounts or conversation changes
  useEffect(() => {
    // Clean up messages when component mounts
    const cleanupStore = useChatStore.getState().cleanupOldMessages;
    cleanupStore();
    
    // Set up periodic cleanup every 30 seconds
    const cleanupInterval = setInterval(() => {
      cleanupStore();
    }, 30000);
    
    // Clean up on unmount or when conversation changes
    return () => {
      clearInterval(cleanupInterval);
      cleanupStore();
      
      // Only reset streaming state if we're unmounting completely, not just changing conversations
      if (!conversation_id) {
        // Reset streaming state to prevent memory leaks
        useChatStore.getState().resetState();
      }
    };
  }, [conversation_id]);

  // Update scroll position state.
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = Math.abs(scrollTop);

    // Show load more button when near top and more messages exist
    if (Math.abs(scrollTop) > scrollHeight - clientHeight - 200 && hasNextPage) {
      setShowLoadMore(true);
    } else {
      setShowLoadMore(false);
    }

    // Update auto-scroll and button visibility based on scroll position
    const isNearBottom = distanceFromBottom < 200;
    setShouldAutoScroll(isNearBottom);
    setShowScrollButton(!isNearBottom);
  }, [hasNextPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Create a throttled scroll handler to reduce the frequency of scroll event processing
    const throttledScrollHandler = throttle(() => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const distanceFromBottom = Math.abs(scrollTop);
  
      // Show load more button when near top and more messages exist
      if (Math.abs(scrollTop) > scrollHeight - clientHeight - 200 && hasNextPage) {
        setShowLoadMore(true);
      } else {
        setShowLoadMore(false);
      }
  
      // Update auto-scroll and button visibility based on scroll position
      const isNearBottom = distanceFromBottom < 200;
      setShouldAutoScroll(isNearBottom);
      setShowScrollButton(!isNearBottom);
    }, 100); // Throttle to once every 100ms
    
    container.addEventListener('scroll', throttledScrollHandler);
    
    return () => {
      container.removeEventListener('scroll', throttledScrollHandler);
      // Clear any pending throttled calls
      if (typeof throttledScrollHandler.cancel === 'function') {
        throttledScrollHandler.cancel();
      }
    };
  }, [hasNextPage]);

  // Function to check if a message was cancelled
  const isMessageCancelled = useCallback((content: string) => {
    return content && typeof content === 'string' && content.endsWith('[cancelled]');
  }, []);

  // Function to format message content by removing the [cancelled] marker
  const formatMessageContent = useCallback((content: string) => {
    if (content && typeof content === 'string' && isMessageCancelled(content)) {
      return content.replace('[cancelled]', '');
    }
    return content;
  }, [isMessageCancelled]);

  return (
    <div className="relative flex flex-col h-full">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex flex-col-reverse flex-1 [overflow-anchor:none] overflow-y-auto scroll-smooth"
      >
        <div className="flex flex-col gap-2 px-4 py-2">
          {/* Load More Button */}
        {showLoadMore && (
          <div className="flex justify-center py-4">
            <Button
              variant="link"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex items-center gap-2"
            >
              {isFetchingNextPage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Load older messages'
              )}
            </Button>
          </div>
        )}

        {allMessages.map((message, index) => {
          const isCancelled = isMessageCancelled(message.content);
          const formattedContent = formatMessageContent(message.content);
          
          return (
            <Message
              key={`${message.id || message.conversation_uuid}-${index}`}
              message={{
                ...message,
                content: formattedContent
              }}
              isTyping={
                isGenerating &&
                index === allMessages.length - 1 &&
                message.role === 'assistant' &&
                !isWaiting
              }
              isWaiting={
                isGenerating &&
                index === allMessages.length - 1 &&
                message.role === 'assistant' &&
                isWaiting
              }
              isLoading={false}
              isCancelled={Boolean(isCancelled)}
            />
          );
        })}
      </div>
      </div>

      <div className="right-0 bottom-0 left-0 absolute pointer-events-none">
        <div className="-top-10 left-1/2 z-10 absolute transform -translate-x-1/2 pointer-events-auto">
          <ScrollToBottomButton
            isVisible={showScrollButton}
            onClick={() => {
              if (containerRef.current) {
                containerRef.current.scrollTo({
                  top: containerRef.current.scrollHeight,
                  behavior: 'smooth',
                });
                setShouldAutoScroll(true);
              }
            }}
          />
        </div>
      </div>
      <div className="absolute top-0 right-0 p-2">
        {isGenerating && <CancelButton onClick={handleCancel} />}
      </div>
    </div>
  );
}
