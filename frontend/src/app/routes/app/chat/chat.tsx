import { ConversationArea } from '@/features/chat/components/chat-area/conversation-area';
import { ConversationAreaHeader } from '@/features/chat/components/chat-area/conversation-area-header';
import { ChatContainer } from '@/features/chat/components/chat-container';
import { motion } from 'framer-motion';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useConversation } from '@/features/chat/hooks/use-conversation';
import { useChatMutation } from '@/features/chat/hooks/use-chat-mutation';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import CannedQuestions from '@/features/chat/components/default-chat/canned-questions';
import { useChatStore } from '@/features/chat/stores/chat-store';
import { useStreamingStore } from '@/features/chat/stores/streaming-store';

// Memoize the landing page content to prevent re-renders
const LandingContent = memo(
  ({
    handleSubmit,
    user,
    currentTheme,
    handleExampleClick,
    handleThemeChange,
    disabled,
    handleCancel,
    isGenerating,
  }: {
    handleSubmit: (message: string, images: string[]) => void;
    user: any;
    currentTheme: 'casual' | 'creative' | 'inspirational' | 'analytical';
    handleExampleClick: (question: string) => void;
    handleThemeChange: (theme: 'casual' | 'creative' | 'inspirational' | 'analytical') => void;
    disabled?: boolean;
    handleCancel: () => void;
    isGenerating: boolean;
  }) => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 p-4 animate-fade-in-up">
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        <h1 className="text-4xl font-bold tracking-tight">
          What can{' '}
          <span className="text-primary">
            CringeAI<span className="text-sm text-primary align-top">™</span>
          </span>{' '}
          do for you?
        </h1>
        <p className="text-muted-foreground text-sm">
          {user?.username
            ? `Hi, ${user.username}. Let's chat.`
            : 'Start a conversation in your preferred style.'}
        </p>
      </motion.div>
      <div className="space-y-6 w-full max-w-2xl mx-auto">
        <div>
          <ChatInput
            onSubmit={handleSubmit}
            disabled={disabled}
            onCancel={handleCancel}
            isGenerating={isGenerating}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
        >
          <CannedQuestions
            theme={currentTheme}
            onQuestionClick={handleExampleClick}
            onThemeChange={handleThemeChange}
          />
        </motion.div>
      </div>
    </div>
  )
);

// Memoize the chat content to prevent re-renders
const ChatContent = memo(
  ({
    searchParamString,
    handleSubmit,
    disabled,
    handleCancel,
    isGenerating,
  }: {
    searchParamString: string;
    handleSubmit: (message: string, images: string[]) => void;
    disabled?: boolean;
    handleCancel: () => void;
    isGenerating: boolean;
  }) => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ChatContainer key={searchParamString} conversation_id={searchParamString} />
      </div>
      <div className="w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto bg-background py-2 gap-2 flex flex-col items-center">
        <div className="w-full max-w-2xl mx-auto bg-background py-2 gap-2 flex flex-col items-center">
          <ChatInput
            onSubmit={handleSubmit}
            disabled={disabled}
            onCancel={handleCancel}
            isGenerating={isGenerating}
          />
          <div className="flex text-xs text-muted-foreground items-center">
            <span>CringeGPT Never Makes Mistakes</span>
          </div>
        </div>
      </div>
    </div>
  )
);

export function ChatRoute() {
  const { conversation } = useConversation();
  const { mutation, isGenerating, handleCancel } = useChatMutation(conversation || undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    streamingMessages, 
    currentConversationId,
    setCurrentConversationId 
  } = useChatStore();

  // Shared state between landing and chat views
  const [currentTheme, setCurrentTheme] = useState<
    'casual' | 'creative' | 'inspirational' | 'analytical'
  >('casual');

  // Clean up stores when component unmounts
  useEffect(() => {
    return () => {
      // Reset chat store state
      useChatStore.getState().resetState();
      // Reset streaming store state
      useStreamingStore.getState().reset();
    };
  }, []);

  // Update current conversation ID when searchParamString changes
  useEffect(() => {
    if (searchParamString && searchParamString !== currentConversationId) {
      setCurrentConversationId(searchParamString);
    } else if (!searchParamString) {
      // If there's no conversation ID in the URL, reset the current conversation ID
      setCurrentConversationId(null);
    }
  }, [searchParamString, currentConversationId, setCurrentConversationId]);

  // Listen for streaming messages changes and update URL if needed
  useEffect(() => {
    if (streamingMessages.length > 0 && !searchParamString) {
      // Find the most recent message with a valid conversation UUID
      const lastMessageWithConversation = [...streamingMessages]
        .reverse()
        .find(msg => msg.conversation_uuid && msg.conversation_uuid !== 'pending');
      
      if (lastMessageWithConversation?.conversation_uuid) {
        // Update URL without triggering a navigation
        setSearchParams({ c: lastMessageWithConversation.conversation_uuid }, { replace: true });
      }
    }
  }, [streamingMessages, searchParamString, setSearchParams]);

  // Only navigate if we're not already on the correct URL and not in the middle of streaming
  useEffect(() => {
    if (searchParamString && searchParamString !== conversation) {
      // Don't navigate if we're already on the correct URL
      if (window.location.href.includes(`c=${searchParamString}`)) {
        return;
      }
      
      // Don't navigate if we're in the middle of streaming a new conversation
      if (isGenerating && streamingMessages.some(msg => msg.conversation_uuid === 'pending')) {
        return;
      }
      
      navigate(`/?c=${searchParamString}`, { replace: true });
    }
  }, [searchParamString, conversation, navigate, isGenerating, streamingMessages]);

  const handleSubmit = useCallback(
    (message: string, images: string[]) => {
      if (!message.trim() && images.length === 0) return;
      mutation.mutate({ message, images });
    },
    [mutation]
  );

  const handleExampleClick = useCallback((question: string) => {
    // We'll use this to set example questions in the UI
    // The actual setting of the input text is now handled by the ChatInput component
    const chatInput = document.querySelector('textarea');
    if (chatInput) {
      // Simulate setting the value and dispatching an input event
      (chatInput as HTMLTextAreaElement).value = question;
      chatInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, []);

  // Type-safe theme change handler
  const handleThemeChange = useCallback(
    (theme: 'casual' | 'creative' | 'inspirational' | 'analytical') => {
      setCurrentTheme(theme);
    },
    []
  );

  // Memoize props for the landing content
  const landingProps = useMemo(
    () => ({
      handleSubmit,
      user,
      currentTheme,
      handleExampleClick,
      handleThemeChange,
      disabled: isGenerating,
      handleCancel,
      isGenerating,
    }),
    [
      handleSubmit,
      user,
      currentTheme,
      handleExampleClick,
      handleThemeChange,
      isGenerating,
      handleCancel,
    ]
  );

  // Memoize props for the chat content
  const chatProps = useMemo(
    () => ({
      searchParamString: searchParamString || '',
      handleSubmit,
      disabled: isGenerating,
      handleCancel,
      isGenerating,
    }),
    [searchParamString, handleSubmit, isGenerating, handleCancel]
  );

  return (
    <div className="relative flex flex-col w-full max-w-full h-screen transition font-geist">
      <ConversationAreaHeader />
      <div className="relative flex flex-col flex-1 transition overflow-hidden">
        <ConversationArea>
          {!searchParamString ? (
            <LandingContent {...landingProps} />
          ) : (
            <ChatContent {...chatProps} />
          )}
        </ConversationArea>
      </div>
    </div>
  );
}
