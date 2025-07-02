import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Message } from './message';
import { useMessages } from '../api/get-messages';
import { useChatMutation } from '../hooks/use-chat-mutation';
import { useChatStore } from '../stores/chat-store';
import { Button } from '@/components/ui/button';
import { ChevronDown, Loader2, X } from 'lucide-react';
import { useMessageScroll } from '../hooks/use-message-scroll';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollToBottomButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  onClick,
  isVisible,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={onClick}
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export function ChatContainer({ conversation_id }: { conversation_id: string }) {
  const { handleCancel } = useChatMutation(conversation_id);
  const { messages = [], fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages({
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
    }
  }, [conversation_id, currentConversationId, setCurrentConversationId]);

  // Filter streaming messages to only show those for the current conversation
  const currentStreamingMessages = useMemo(() => {
    return streamingMessages.filter(msg => msg.conversation_uuid === conversation_id);
  }, [streamingMessages, conversation_id]);

  // Combine existing messages and any streaming updates for the current conversation
  const allMessages = useMemo(() => {
    return [...messages, ...currentStreamingMessages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages, currentStreamingMessages]);

  const lastStreamingMessageContent = useMemo(() => {
    if (currentStreamingMessages.length > 0) {
      return currentStreamingMessages[currentStreamingMessages.length - 1].content;
    }
    return '';
  }, [currentStreamingMessages]);

  const { containerRef, showScrollButton, scrollToBottom } = useMessageScroll(allMessages);

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
    });
  }, [allMessages, isMessageCancelled, isGenerating, isFetchingNextPage, isWaiting]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-y-auto"
    >
      <div className="flex flex-col gap-2 px-4 py-2">
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {renderedMessages}
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <ScrollToBottomButton isVisible={showScrollButton} onClick={scrollToBottom} />
      </div>
    </div>
  );
}
