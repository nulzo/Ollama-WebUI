import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { useModelStore } from '@/features/models/store/model-store';
import { useSubmitHandler } from '@/features/chat/hooks/use-submit-handler';
import CannedQuestions from '@/features/chat/components/default-chat/canned-questions';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { FunctionCallToggle } from '../function-call-toggle';

export const LandingPage = memo(() => {
  const { user } = useAuth();
  const model = useModelStore((state) => state.model);
  const { handleSubmit, isSubmitting } = useSubmitHandler();
  const [functionCall, setFunctionCall] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<
    'casual' | 'creative' | 'inspirational' | 'analytical'
  >('casual');

  const handleExampleClick = useCallback(
    (question: string) => {
      handleSubmit(question, undefined, undefined, functionCall);
    },
    [handleSubmit, functionCall],
  );

  const handleThemeChange = useCallback(
    (theme: 'casual' | 'creative' | 'inspirational' | 'analytical') => {
      setCurrentTheme(theme);
    },
    [],
  );

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
          {user?.username ? `Hi, ${user.username}. Let's chat.` : 'Start a conversation in your preferred style.'}
        </p>
      </motion.div>
      <div className="space-y-6 mx-auto w-full max-w-2xl">
        <div>
          {model?.tools_enabled && (
            <FunctionCallToggle enabled={functionCall} onToggle={setFunctionCall} />
          )}
          <ChatInput
            onSubmit={(message, images, knowledgeIds) => handleSubmit(message, images, knowledgeIds, functionCall)}
            disabled={isSubmitting}
            isGenerating={isSubmitting}
            onCancel={() => {}}
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
});

LandingPage.displayName = 'LandingPage'; 