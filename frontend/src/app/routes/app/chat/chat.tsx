import { ConversationArea } from '@/features/chat/components/chat-area/conversation-area';
import { ConversationAreaHeader } from '@/features/chat/components/chat-area/conversation-area-header';
import { ChatContainer } from '@/features/chat/components/chat-container';
import { motion, AnimatePresence } from 'framer-motion';
import AutoResizeTextarea from '@/features/textbox/components/new-textbox';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useConversation } from '@/features/chat/hooks/use-conversation';
import { useChatMutation } from '@/features/chat/hooks/use-chat-mutation';
import { useAuth } from '@/hooks/use-auth';
import CannedQuestions from '@/features/chat/components/default-chat/canned-questions';

export function ChatRoute() {
  const { conversation } = useConversation();
  const { mutation } = useChatMutation(conversation || undefined);
  const [searchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Shared state between landing and chat views
  const [input, setInput] = useState('');
  const [currentTheme, setCurrentTheme] = useState<
    'casual' | 'creative' | 'inspirational' | 'analytical'
  >('casual');

  useEffect(() => {
    if (searchParamString && searchParamString !== conversation) {
      navigate(`/?c=${searchParamString}`);
    }
  }, [searchParamString, conversation, navigate]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    mutation.mutate({ content: input, images: [] });
    setInput('');
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] }, // Easing function for smooth animation
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2, ease: 'easeOut' },
  };

  return (
    <div className="relative flex flex-col w-full max-w-full h-screen transition font-geist">
      <ConversationAreaHeader />
      <div className="relative flex flex-col flex-1 transition overflow-hidden">
        <ConversationArea>
          <AnimatePresence mode="wait">
            {!searchParamString ? (
              <motion.div
                key="landing"
                {...fadeInUp}
                className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 p-4"
              >
                <motion.div
                  className="text-center space-y-2"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <h1 className="text-4xl font-bold tracking-tight">
                    Welcome to <span className="text-primary">CringeAI</span>
                    <span className="text-sm text-primary align-top">™</span>
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {user?.username
                      ? `Hi, ${user.username}. Start a conversation in your preferred style.`
                      : 'Start a conversation in your preferred style.'}
                  </p>
                </motion.div>
                <div className="space-y-6 w-full max-w-2xl mx-auto">
                  <motion.div
                    layoutId="chat-input"
                    layout="position"
                    transition={{
                      layout: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
                    }}
                  >
                    <AutoResizeTextarea
                      text={input}
                      setText={setInput}
                      onSubmit={handleSubmit}
                      model="default"
                      onImageUpload={() => {}}
                      onRemoveImage={() => {}}
                      uploadedImages={[]}
                      placeholder="Send a message..."
                      onCancel={() => {}}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                  >
                    <CannedQuestions
                      theme={currentTheme}
                      onQuestionClick={handleExampleClick}
                      onThemeChange={setCurrentTheme}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="chat" {...fadeIn} className="flex flex-col h-full">
                <div className="flex-1 overflow-hidden">
                  <ChatContainer conversation_id={searchParamString} />
                </div>
                <div className="w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto bg-background py-2 gap-2 flex flex-col items-center">
                  <motion.div
                    layoutId="chat-input"
                    layout="position"
                  transition={{
                    layout: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
                  }}
                  className="w-full max-w-2xl mx-auto bg-background py-2 gap-2 flex flex-col items-center"
                >
                  <AutoResizeTextarea
                    text={input}
                    setText={setInput}
                    onSubmit={handleSubmit}
                    model="default"
                    onImageUpload={() => {}}
                    onRemoveImage={() => {}}
                    uploadedImages={[]}
                    placeholder="Send a message..."
                    onCancel={() => {}}
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                    className="flex text-xs text-muted-foreground items-center"
                  >
                    <span>CringeGPT Never Makes Mistakes</span>
                  </motion.div>
                </motion.div>
                </div>
                
              </motion.div>
            )}
          </AnimatePresence>
        </ConversationArea>
      </div>
    </div>
  );
}
