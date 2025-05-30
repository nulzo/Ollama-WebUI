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
import { toast } from '@/components/ui/use-toast';
import { useModelStore } from '@/features/models/store/model-store';
import { Code } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Memoize the landing page content to prevent re-renders
const LandingContent = ({
  handleSubmit,
  user,
  currentTheme,
  handleExampleClick,
  handleThemeChange,
  disabled,
  handleCancel,
  isGenerating,
  functionCall,
  setFunctionCall,
}: {
  handleSubmit: (message: string, images?: string[], knowledgeIds?: string[], functionCall?: boolean) => void;
  user: any;
  currentTheme: 'casual' | 'creative' | 'inspirational' | 'analytical';
  handleExampleClick: (question: string) => void;
  handleThemeChange: (theme: 'casual' | 'creative' | 'inspirational' | 'analytical') => void;
  disabled?: boolean;
  handleCancel: () => void;
  isGenerating: boolean;
  functionCall: boolean;
  setFunctionCall: (value: boolean) => void;
}) => {
  // Get the model from the store
  const model = useModelStore(state => state.model);
  
  return (
    <div className="flex flex-col justify-center items-center space-y-8 p-4 min-h-[80vh] animate-fade-in-up">
      <motion.div
        className="space-y-2 text-center"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        <h1 className="font-bold text-4xl tracking-tight">
          What can{' '}
          <span className="text-primary">
            CringeAI<span className="text-primary text-sm align-top">™</span>
          </span>{' '}
          do for you?
        </h1>
        <p className="text-muted-foreground text-sm">
          {user?.username
            ? `Hi, ${user.username}. Let's chat.`
            : 'Start a conversation in your preferred style.'}
        </p>
      </motion.div>
      <div className="space-y-6 mx-auto w-full max-w-2xl">
        <div>
          {/* Function Call Toggle - Redesigned for better UX */}
          {model?.tools_enabled && (
            <div className="flex justify-end items-center mb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 bg-secondary/30 hover:bg-secondary/40 px-3 py-1.5 rounded-full transition-colors cursor-pointer" onClick={() => setFunctionCall(!functionCall)}>
                      <div className={`flex items-center justify-center w-5 h-5 rounded-full ${functionCall ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        <Code className="w-3 h-3" />
                      </div>
                      <span className="font-medium text-xs">
                        {functionCall ? 'Tools Enabled' : 'Tools Disabled'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Enable AI to use your custom tools and functions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          <ChatInput
            onSubmit={handleSubmit}
            disabled={disabled}
            onCancel={handleCancel}
            isGenerating={isGenerating}
            functionCall={functionCall}
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
  );
};

// Memoize the chat content to prevent re-renders
const ChatContent = ({
  searchParamString,
  handleSubmit,
  disabled,
  handleCancel,
  isGenerating,
  functionCall,
  setFunctionCall,
}: {
  searchParamString: string;
  handleSubmit: (message: string, images?: string[], knowledgeIds?: string[], functionCall?: boolean) => void;
  disabled?: boolean;
  handleCancel: () => void;
  isGenerating: boolean;
  functionCall: boolean;
  setFunctionCall: (value: boolean) => void;
}) => {
  // Get the model from the store
  const model = useModelStore(state => state.model);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <ChatContainer conversation_id={searchParamString} />
      </div>
      <div className="p-4 border-t">
        {/* Function Call Toggle - Redesigned for better UX */}
        {model?.tools_enabled && (
          <div className="flex justify-end items-center mb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 bg-secondary/30 hover:bg-secondary/40 px-3 py-1.5 rounded-full transition-colors cursor-pointer" onClick={() => setFunctionCall(!functionCall)}>
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${functionCall ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Code className="w-3 h-3" />
                    </div>
                    <span className="font-medium text-xs">
                      {functionCall ? 'Tools Enabled' : 'Tools Disabled'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Enable AI to use your custom tools and functions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        <ChatInput
          onSubmit={handleSubmit}
          disabled={disabled}
          onCancel={handleCancel}
          isGenerating={isGenerating}
          functionCall={functionCall}
        />
      </div>
    </div>
  );
};

export default function Chat() {
  const { conversation } = useConversation();
  const { mutation, isGenerating, handleCancel } = useChatMutation(conversation || undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    streamingMessages, 
    currentConversationId,
    setCurrentConversationId,
    resetState
  } = useChatStore();
  const model = useModelStore(state => state.model);

  // Shared state between landing and chat views
  const [currentTheme, setCurrentTheme] = useState<
    'casual' | 'creative' | 'inspirational' | 'analytical'
  >('casual');
  const [functionCallEnabled, setFunctionCallEnabled] = useState(false);

  // Check if the model supports function calling
  useEffect(() => {
    // Reset function call enabled state when model changes
    if (model) {
      console.log('Model changed, tools_enabled:', model.tools_enabled);
      // If the model doesn't support tools, disable function calling
      if (!model.tools_enabled) {
        setFunctionCallEnabled(false);
      }
    }
  }, [model]);

  // Clean up stores when component unmounts
  useEffect(() => {
    return () => {
      // Reset chat store state
      useChatStore.getState().resetState();
      // Reset streaming store state
      useStreamingStore.getState().reset();
    };
  }, []);

  // Handle new chat button click
  const handleNewChat = useCallback(() => {
    // Reset state first
    resetState();
    // Then navigate to the root URL without conversation parameter
    navigate('/', { replace: true });
    // Clear search params
    setSearchParams({}, { replace: true });
  }, [navigate, setSearchParams, resetState]);

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

  // Expose the handleNewChat function to the ConversationAreaHeader component
  useEffect(() => {
    // Add the handleNewChat function to the window object so it can be accessed by other components
    // @ts-ignore
    window.handleNewChat = handleNewChat;
    
    return () => {
      // Clean up when component unmounts
      // @ts-ignore
      delete window.handleNewChat;
    };
  }, [handleNewChat]);

  const handleSubmit = useCallback(
    async (message: string, images: string[] = [], knowledgeIds: string[] = [], functionCall: boolean = false) => {
      if (!message.trim() && images.length === 0) return;

      try {
        console.log('Submitting message with function call:', functionCall);
        
        // Send the message - the backend will create a conversation if needed
        await mutation.mutateAsync({
          message,
          images,
          knowledge_ids: knowledgeIds.length > 0 ? knowledgeIds : undefined,
          function_call: functionCall,
        } as any);
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [mutation, toast]
  );

  const handleExampleClick = useCallback((question: string) => {
    // Find the textarea element
    const chatInput = document.querySelector('textarea');
    if (chatInput) {
      // Set the value
      (chatInput as HTMLTextAreaElement).value = question;
      
      // Create and dispatch an input event to trigger React's onChange handlers
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      chatInput.dispatchEvent(inputEvent);
      
      // Also create and dispatch a change event for good measure
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      chatInput.dispatchEvent(changeEvent);
      
      // Force a resize calculation by triggering a resize event on the window
      window.dispatchEvent(new Event('resize'));
      
      // Focus the textarea
      chatInput.focus();
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
      functionCall: functionCallEnabled,
      setFunctionCall: setFunctionCallEnabled,
    }),
    [
      handleSubmit,
      user,
      currentTheme,
      handleExampleClick,
      handleThemeChange,
      isGenerating,
      handleCancel,
      functionCallEnabled,
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
      functionCall: functionCallEnabled,
      setFunctionCall: setFunctionCallEnabled,
    }),
    [searchParamString, handleSubmit, isGenerating, handleCancel, functionCallEnabled]
  );

  return (
    <div className="relative flex flex-col w-full max-w-full h-screen font-geist transition">
      <ConversationAreaHeader />
      <div className="relative flex flex-col flex-1 overflow-hidden transition">
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
