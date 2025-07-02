import { ConversationArea } from '@/features/chat/components/chat-area/conversation-area';
import { ConversationAreaHeader } from '@/features/chat/components/chat-area/conversation-area-header';
import { ChatContainer } from '@/features/chat/components/chat-container';
import { motion } from 'framer-motion';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { useCallback, useMemo, memo } from 'react';
import { useChatMutation } from '@/features/chat/hooks/use-chat-mutation';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import CannedQuestions from '@/features/chat/components/default-chat/canned-questions';
import { toast } from '@/components/ui/use-toast';
import { Code } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useChatView } from '@/features/chat/hooks/use-chat-view';
import { useModelStore } from '@/features/models/store/model-store';

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
    functionCall,
    setFunctionCall,
  }: {
    handleSubmit: (
      message: string,
      images?: string[],
      knowledgeIds?: string[],
      functionCall?: boolean,
    ) => void;
    user: any;
    currentTheme: 'casual' | 'creative' | 'inspirational' | 'analytical';
    handleExampleClick: (question: string) => void;
    handleThemeChange: (theme: 'casual' | 'creative' | 'inspirational' | 'analytical') => void;
    disabled?: boolean;
    handleCancel: () => void;
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
  },
);

// Memoize the chat content to prevent re-renders
const ChatContent = memo(
  ({
    searchParamString,
    handleSubmit,
    disabled,
    handleCancel,
    functionCall,
    setFunctionCall,
  }: {
    searchParamString: string;
    handleSubmit: (
      message: string,
      images?: string[],
      knowledgeIds?: string[],
      functionCall?: boolean,
    ) => void;
    disabled?: boolean;
    handleCancel: () => void;
    functionCall: boolean;
    setFunctionCall: (value: boolean) => void;
  }) => {
    const model = useModelStore(state => state.model);
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0">
          <ChatContainer conversation_id={searchParamString} />
        </div>
        <div className="p-4 border-t flex-shrink-0">
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
            functionCall={functionCall}
          />
        </div>
      </div>
    );
  },
);

export default function Chat() {
  const { user } = useAuth();
  const {
    searchParamString,
    currentTheme,
    functionCallEnabled,
    setFunctionCallEnabled,
    handleNewChat,
    handleThemeChange,
  } = useChatView();

  const { mutation, status, handleCancel } = useChatMutation(searchParamString || undefined);
  const isGenerating = status === 'generating' || status === 'waiting';

  const handleSubmit = useCallback(
    async (
      message: string,
      images: string[] = [],
      knowledgeIds: string[] = [],
      functionCall: boolean = false,
    ) => {
      if (!message.trim() && images.length === 0) return;

      try {
        await mutation.mutateAsync({
          message,
          images,
          knowledge_ids: knowledgeIds.length > 0 ? knowledgeIds : undefined,
          function_call: functionCall,
        });
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [mutation],
  );

  const handleExampleClick = useCallback((question: string) => {
    const chatInput = document.querySelector('textarea');
    if (chatInput) {
      (chatInput as HTMLTextAreaElement).value = question;
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      chatInput.dispatchEvent(inputEvent);
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      chatInput.dispatchEvent(changeEvent);
      window.dispatchEvent(new Event('resize'));
      chatInput.focus();
    }
  }, []);

  const landingProps = useMemo(
    () => ({
      handleSubmit,
      user,
      currentTheme,
      handleExampleClick,
      handleThemeChange,
      disabled: isGenerating,
      handleCancel,
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
      setFunctionCallEnabled,
    ],
  );

  const chatProps = useMemo(
    () => ({
      searchParamString: searchParamString || '',
      handleSubmit,
      disabled: isGenerating,
      handleCancel,
      functionCall: functionCallEnabled,
      setFunctionCall: setFunctionCallEnabled,
    }),
    [
      searchParamString,
      handleSubmit,
      isGenerating,
      handleCancel,
      functionCallEnabled,
      setFunctionCallEnabled,
    ],
  );

  return (
    <div className="relative flex flex-col w-full max-w-full h-screen font-geist transition">
      <ConversationAreaHeader onNewChat={handleNewChat} />
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
