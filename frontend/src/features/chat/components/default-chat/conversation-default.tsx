import { useState, useRef, useEffect, useCallback } from 'react';
// import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
// import { usePrompts } from "../../api/get-default-prompts";
import { useChatMutation } from '@/features/chat/hooks/use-chat-mutation';
// These components are assumed to exist (or create them based on your design)
import { Message } from '../message';
import CannedQuestions from './canned-questions';
import AutoResizeTextarea from '@/features/textbox/components/new-textbox';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { Message as MessageType } from '@/features/chat/types/message';

// Define a simpler local message type for this component
interface LocalMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string;
}

// Wrapper component to adapt LocalMessage to MessageType
const MessageWrapper = ({ message }: { message: LocalMessage }) => {
  // Create a compatible message object with required fields
  const compatibleMessage: MessageType = {
    id: message.id,
    content: message.content,
    role: message.role,
    created_at: message.created_at || new Date().toISOString(),
    conversation_uuid: 'temp',
    model: 'temp',
    name: message.role === 'user' ? 'You' : 'Assistant',
    has_images: false,
    provider: 'temp'
  };
  
  return <Message message={compatibleMessage} />;
};

export const ConversationDefault = () => {
  // State for landing view and when a chat has started
  const [chatStarted, setChatStarted] = useState(false);
  // Local input state
  const [input, setInput] = useState('');
  // Local messages (for the user's own messages) until the new conversation is created
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
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

    const userMessage: LocalMessage = {
      id: Date.now(),
      content: input,
      role: 'user',
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
    <div className="flex flex-col items-center bg-background p-4 min-h-screen text-foreground">
      <main className="flex flex-col flex-1 w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {!chatStarted ? (
            <motion.div
              key="landing-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col justify-center items-center space-y-8 min-h-[80vh]"
            >
              <div className="space-y-2 text-center">
                <h1 className="font-bold text-4xl tracking-tight">
                  Welcome to <span className="font-bold text-primary">CringeAI</span><span className='font-base text-primary text-sm align-top'>™</span>
                </h1>
                <p className="font-base text-muted-foreground text-sm">
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
                <MessageWrapper key={message.id} message={message} />
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
            className="bottom-0 sticky bg-background py-4 border-t"
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
