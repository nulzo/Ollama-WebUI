import { useState, useRef, useEffect, useMemo } from 'react';
import { FC } from 'react';
import { Message } from './message';
import { useMessages } from '../api/get-messages';
import { useChatMutation } from '../hooks/use-chat-mutation';
import { useChatContext } from '../stores/chat-context';
import { Button } from '@/components/ui/button';
import { ChevronDown, X } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface ScrollToBottomButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export const ScrollToBottomButton: FC<ScrollToBottomButtonProps> = ({ onClick, isVisible }) => {
  if (!isVisible) return null;

  return (
    <Button
      onClick={onClick}
      variant='outline'
      className="flex items-center gap-1 shadow-lg border rounded-lg"
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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { streamingMessages, isGenerating } = useChatContext();
  const { messages } = useMessages({ conversation_id });
  const { handleCancel } = useChatMutation(conversation_id);

  // Combine API messages with streaming messages
  const allMessages = useMemo(() => {
    const apiMessages = messages?.map(m => m.data) || [];
    return [...apiMessages, ...streamingMessages];
  }, [messages, streamingMessages]);

  const { ref: bottomRef, inView: isAtBottom } = useInView({
    threshold: 0.5,
  });

  // Simplified scroll handling
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - clientHeight - scrollTop;
    
    // Show scroll button when not at bottom
    setShowScrollButton(distanceFromBottom > 100);
    
    // Update auto-scroll only while generating
    if (isGenerating) {
      setShouldAutoScroll(distanceFromBottom < 100);
    }
  };

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth',
    });
    setShouldAutoScroll(true);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (isGenerating && shouldAutoScroll) {
      scrollToBottom();
    }
  }, [streamingMessages, isGenerating, shouldAutoScroll]);

  // Initial scroll
  useEffect(() => {
    if (messages?.length) {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'auto',
      });
    }
  }, [messages]);

  return (
    <div className="relative flex flex-col h-full">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="flex flex-col space-y-4 p-4">
          {allMessages.map((message, index) => (
            <Message
            key={index}
            content={message.content}
            role={message.role}
            time={new Date(message.created_at).getTime()}
            username={message.role === 'user' ? 'You' : 'Assistant'}
            modelName={message.model || 'claude-3-opus-20240229'} // Default model if not specified
            conversation_id={conversation_id}
            image_ids={message.image_ids || []}
            isTyping={isGenerating && message.role === 'assistant'}
          />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="right-0 bottom-0 left-0 absolute">
        <div className="-top-14 left-1/2 z-10 absolute transform -translate-x-1/2">
          <ScrollToBottomButton
            isVisible={showScrollButton}
            onClick={scrollToBottom}
          />
        </div>

        {isGenerating && (
          <div className="-top-16 right-4 z-10 absolute">
            <CancelButton onClick={handleCancel} />
          </div>
        )}
      </div>
    </div>
  );
}
