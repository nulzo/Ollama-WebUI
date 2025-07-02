import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Message } from './message';
import { useMessages } from '../api/get-messages';
import { useChatMutation } from '../hooks/use-chat-mutation';
import { useChatStore } from '../stores/chat-store';
import { Button } from '@/components/ui/button';
import { ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
        transition={{ 
          duration: 0.2,
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        <Button
          onClick={onClick}
          variant="outline"
          size="sm"
          className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm border-2 hover:bg-background/90 hover:scale-105 transition-all duration-200"
          aria-label="Scroll to bottom of conversation"
        >
          <span className="text-sm mr-2">New messages</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export function ChatContainer({ conversation_id }: { conversation_id: string }) {
  const { messages = [], fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages({
    conversation_id,
  });
  const { 
    streamingMessages, 
    status,
    currentConversationId,
    setCurrentConversationId
  } = useChatStore();

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update current conversation ID when the component mounts or conversation_id changes
  useEffect(() => {
    if (conversation_id && conversation_id !== currentConversationId) {
      setCurrentConversationId(conversation_id);
    }
  }, [conversation_id, currentConversationId, setCurrentConversationId]);

  // Filter streaming messages to only show those for the current conversation
  const currentStreamingMessages = useMemo(() => {
    return streamingMessages.filter(msg => msg.conversation_uuid === conversation_id);
  }, [streamingMessages, conversation_id]);

  // Combine existing messages and any streaming updates for the current conversation
  const allMessages = useMemo(() => {
    const combined = [...messages, ...currentStreamingMessages].sort(
      (a, b) => new Date(a.createdAt || a.created_at).getTime() - new Date(b.createdAt || b.created_at).getTime()
    );
    return combined;
  }, [messages, currentStreamingMessages]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;

    setShouldAutoScroll(isAtBottom);
    setShowScrollButton(!isAtBottom);
  }, []);

  // Attach scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Auto-scroll to bottom when new messages arrive (only if user is at bottom)
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages, shouldAutoScroll]);

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

  const renderedMessages = useMemo(() => {
    const isGenerating = status === 'generating';
    const isWaiting = status === 'waiting';
    
    return allMessages.map((message, index) => {
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
            message.role === 'assistant'
          }
          isWaiting={
            isWaiting &&
            index === allMessages.length - 1 &&
            message.role === 'assistant'
          }
          isLoading={false}
          isCancelled={Boolean(isCancelled)}
        />
      );
    });
  }, [allMessages, isMessageCancelled, formatMessageContent, status]);

  const handleScrollToBottomClick = useCallback(() => {
    setShouldAutoScroll(true);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="relative flex flex-col h-full bg-background">
      {/* 
        The flex-col-reverse technique is used for a pure CSS solution to start the chat at the bottom.
        1. The outer container handles scrolling (`overflow-y-auto`).
        2. The inner container uses `flex-col-reverse` to stack items from bottom to top.
           This makes the browser's default scroll position (the "start") become the visual bottom of the chat.
        3. `space-y-reverse` is needed to apply spacing correctly in a reversed flex column.
      */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
      >
        <div className="flex flex-col-reverse space-y-4 space-y-reverse">
          {/* Messages end ref - Placed at the start of the DOM, which is the visual bottom in a reversed column. */}
          <div ref={messagesEndRef} />

          {/* 
            Render messages in reverse.
            `flex-col-reverse` reverses the DOM order, so we must reverse the array
            to display messages in the correct chronological order (newest at the bottom). 
          */}
          {[...renderedMessages].reverse()}
          
          {/* Loading indicator for fetching more messages - Placed at the end of the DOM, which is the visual top. */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Scroll to bottom button */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
        <ScrollToBottomButton
          isVisible={showScrollButton}
          onClick={handleScrollToBottomClick}
        />
      </div>
    </div>
  );
}
