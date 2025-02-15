import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FC } from 'react';
import { Message } from './message';
import { useMessages } from '../api/get-messages';
import { useChatMutation } from '../hooks/use-chat-mutation';
import { useChatContext } from '../stores/chat-context';
import { Button } from '@/components/ui/button';
import { ChevronDown, Loader2, X } from 'lucide-react';

interface ScrollToBottomButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export const ScrollToBottomButton: FC<ScrollToBottomButtonProps> = ({ onClick, isVisible }) => {
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

export const CancelButton: FC<CancelButtonProps> = ({ onClick }) => {
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

  const { handleCancel } = useChatMutation(conversation_id);
  const { messages, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages({
    conversation_id,
  });
  const { streamingMessages, isGenerating, isWaiting } = useChatContext();

  const allMessages = useMemo(() => {
    return [...messages, ...streamingMessages];
  }, [messages, streamingMessages]);

  // Only auto-scroll for new messages at bottom
  useEffect(() => {
    if (
      shouldAutoScroll &&
      containerRef.current &&
      (streamingMessages.length > 0 || isGenerating)
    ) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [streamingMessages, isGenerating, shouldAutoScroll]);

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
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </>
                ) : (
                  <>Load older messages</>
                )}
              </Button>
            </div>
          )}

          {allMessages.map((message, index) => (
            <Message
              key={message.id || index}
              message={message}
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
            />
          ))}
        </div>
      </div>

      <div className="right-0 bottom-0 left-0 absolute pointer-events-none">
        <div className="-top-10 left-1/2 z-10 absolute transform -translate-x-1/2 pointer-events-auto">
          <ScrollToBottomButton
            isVisible={showScrollButton}
            onClick={() => {
              containerRef.current?.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
              setShouldAutoScroll(true);
            }}
          />
        </div>
      </div>
    </div>
  );
}
