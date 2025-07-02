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
    // A threshold of 50px to decide if the user is at the bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

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

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages, shouldAutoScroll]);

  // Clean up messages when component mounts or conversation changes
  useEffect(() => {
    const cleanupStore = useChatStore.getState().cleanupOldMessages;
    cleanupStore();
    
    const cleanupInterval = setInterval(() => {
      cleanupStore();
    }, 30000);
    
    return () => {
      clearInterval(cleanupInterval);
      cleanupStore();
      
      if (!conversation_id) {
        useChatStore.getState().resetState();
      }
    };
  }, [conversation_id]);

  const isMessageCancelled = useCallback((content: string) => {
    return content && typeof content === 'string' && content.endsWith('[cancelled]');
  }, []);

  const formatMessageContent = useCallback((content: string) => {
    if (content && typeof content === 'string' && isMessageCancelled(content)) {
      return content.replace('[cancelled]', '');
    }
    return content;
  }, [isMessageCancelled]);

  const renderedMessages = useMemo(() => {
    return allMessages.map((message, index) => (
      <Message
        key={`${message.id || message.conversation_uuid}-${index}`}
        message={{
          ...message,
          content: formatMessageContent(message.content),
        }}
        isTyping={status === 'generating' && index === allMessages.length - 1 && message.role === 'assistant'}
        isWaiting={status === 'waiting' && index === allMessages.length - 1 && message.role === 'assistant'}
        isLoading={false}
        isCancelled={!!isMessageCancelled(message.content)}
      />
    ));
  }, [allMessages, status, formatMessageContent, isMessageCancelled]);

  const handleScrollToBottomClick = useCallback(() => {
    setShouldAutoScroll(true);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="relative flex flex-col h-full bg-background">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
      >
        <div className="flex flex-col-reverse space-y-4 space-y-reverse">
          <div ref={messagesEndRef} />
          {[...renderedMessages].reverse()}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
        <ScrollToBottomButton
          isVisible={showScrollButton}
          onClick={handleScrollToBottomClick}
        />
      </div>
    </div>
  );
}
