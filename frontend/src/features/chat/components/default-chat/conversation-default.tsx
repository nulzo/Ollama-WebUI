import { useState, useRef, useEffect, useCallback } from 'react';
// import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip, Send, MessageCircle, RefreshCcw } from 'lucide-react';
// import { usePrompts } from "../../api/get-default-prompts";
import { useChatMutation } from '@/features/chat/hooks/use-chat-mutation';
// These components are assumed to exist (or create them based on your design)
import { Message } from '../message';
import CannedQuestions from './canned-questions';
import AutoResizeTextarea from '@/features/textbox/components/new-textbox';
import { useAuth } from '@/features/authentication/hooks/use-auth';

const exampleQuestions: Record<string, string[]> = {
  casual: ["How's your day going?", "What's your favorite hobby?", 'Tell me a fun fact'],
  creative: [
    'Write a short story about a dragon',
    'Design a unique superhero',
    'Invent a new musical instrument',
  ],
  inspirational: [
    'Share a motivational quote',
    'How can I achieve my goals?',
    'Tell me about overcoming challenges',
  ],
  analytical: [
    'Explain quantum computing',
    'Analyze market trends',
    'Compare different algorithms',
  ],
};

export function ExampleChips({
  theme,
  onChipClick,
}: {
  theme: string;
  onChipClick: (question: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {exampleQuestions[theme].map(question => (
        <Button
          key={question}
          variant="outline"
          size="sm"
          onClick={() => onChipClick(question)}
          className="rounded-full hover:bg-secondary hover:text-secondary-foreground transition-colors"
        >
          {question}
        </Button>
      ))}
    </div>
  );
}

export interface Message {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string;
}

export const ConversationDefault = () => {
  // State for landing view and when a chat has started
  const [chatStarted, setChatStarted] = useState(false);
  // Local input state
  const [input, setInput] = useState('');
  // Local messages (for the user’s own messages) until the new conversation is created
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  // Allow the user to select a conversation style (theme)
  const [currentTheme, setCurrentTheme] = useState<
    'casual' | 'creative' | 'inspirational' | 'analytical'
  >('casual');

  // Get recommended prompts (for example chips)
  // const { data, isLoading, isFetching, refetch } = usePrompts({
  //   style: currentTheme,
  // });

  // Use our chat mutation without an existing conversation id.
  // The mutation will create a new chat (and navigate) if no conversation exists.
  const { mutation, isGenerating } = useChatMutation(undefined);
  // const navigate = useNavigate();

  // Refs to auto-adjust and scroll the text area / messages
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, scrollToBottom]);

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  // Update the handleMessageSubmit to not expect an event
  const handleMessageSubmit = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      content: input,
      role: 'user',
      created_at: new Date().toISOString(),
    };

    setLocalMessages(prev => [...prev, userMessage]);
    setInput('');
    if (!chatStarted) {
      setChatStarted(true);
    }
    mutation.mutate({ message: userMessage.content, images: [] });
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file uploads as needed.
    console.log('File uploaded:', e.target.files);
  };

  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme as 'casual' | 'creative' | 'inspirational' | 'analytical');
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-4">
      <main className="flex-1 w-full max-w-4xl flex flex-col">
        <AnimatePresence mode="wait">
          {!chatStarted ? (
            <motion.div
              key="landing-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[80vh] space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">
                  Welcome to <span className="font-bold text-primary">CringeAI</span><span className='text-sm text-primary font-base align-top'>™</span>
                </h1>
                <p className="text-muted-foreground text-sm font-base">
                  {user?.username
                    ? `Hi, ${user.username}. Start a conversation in your preferred style.`
                    : 'Start a conversation in your preferred style.'}
                </p>
              </div>
              <div className="space-y-6 w-full max-w-2xl">
                <AutoResizeTextarea
                  text={input}
                  setText={setInput}
                  onSubmit={handleMessageSubmit}
                  model="default"
                  onImageUpload={() => {}}
                  onRemoveImage={() => {}}
                  uploadedImages={[]}
                  placeholder="Send a message..."
                  onCancel={() => {}}
                  isGenerating={false}
                />
                <div className="space-y-4">
                  <CannedQuestions
                    theme={currentTheme}
                    onQuestionClick={handleExampleClick}
                    onThemeChange={handleThemeChange}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat-mode"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 space-y-6 overflow-y-auto"
            >
              {localMessages.map(message => (
                <Message key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
        {chatStarted && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="sticky bottom-0 py-4 bg-background border-t"
          >
            <AutoResizeTextarea
              text={input}
              setText={setInput}
              onSubmit={handleMessageSubmit}
              model="default"
              onImageUpload={() => {}}
              onRemoveImage={() => {}}
              uploadedImages={[]}
              placeholder="Send a message..."
              onCancel={() => {}}
              isGenerating={false}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
};
