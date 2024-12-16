import { useState, useRef } from 'react';
import { MessagesList } from '@/features/chat/components/message-list.tsx';
import { useConversation } from '@/features/chat/hooks/use-conversation.ts';
import { FC } from 'react';

interface ScrollToBottomButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export const ScrollToBottomButton: FC<ScrollToBottomButtonProps> = ({ onClick, isVisible }) => {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 border-gray-200 bg-white hover:bg-gray-50 shadow-lg px-4 py-2 border rounded-full text-gray-700 transition-all duration-200"
      aria-label="Scroll to bottom"
    >
      <span>New messages</span>
      <svg
        className="w-5 h-5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    </button>
  );
};

interface CancelButtonProps {
  onClick: () => void;
}

export const CancelButton: FC<CancelButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 shadow-lg px-4 py-2 rounded-full text-white transition-all duration-200"
      aria-label="Cancel generation"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      <span>Stop generating</span>
    </button>
  );
};

export function ChatContainer({ conversation_id }: { conversation_id: string }) {
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { cancelGeneration, isStreaming, streamingContent } = useConversation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShouldAutoScroll(true);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    setShouldAutoScroll(isAtBottom);
    setShowScrollButton(!isAtBottom);
  };

  return (
    <div className="relative flex flex-col h-screen">
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        <MessagesList
          conversation_id={conversation_id}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className="right-0 bottom-0 left-0 absolute">
        <div className="-top-16 left-1/2 z-10 absolute transform -translate-x-1/2">
          <ScrollToBottomButton isVisible={showScrollButton} onClick={scrollToBottom} />
        </div>

        {isStreaming && (
          <div className="-top-16 right-4 z-10 absolute">
            <CancelButton onClick={cancelGeneration} />
          </div>
        )}
      </div>
    </div>
  );
}
