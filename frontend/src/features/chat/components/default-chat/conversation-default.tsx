import { usePrompts } from '../../api/get-default-prompts';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, RefreshCcw, Sparkles, Brain, Lightbulb, Coffee, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
// Adjust the import if you have a different hook/config for model details.
import { useModelStore } from '@/features/models/store/model-store';

interface Message {
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

const promptStyles = [
  { name: 'Creative', icon: <Sparkles className="w-4 h-4" /> },
  { name: 'Analytical', icon: <Brain className="w-4 h-4" /> },
  { name: 'Inspirational', icon: <Lightbulb className="w-4 h-4" /> },
  { name: 'Casual', icon: <Coffee className="w-4 h-4" /> },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
};

export const ConversationDefault = () => {
  // State to manage the landing view vs conversation mode
  const [chatStarted, setChatStarted] = useState(false);
  // For conversation style selection and recommended prompts
  const [selectedStyle, setSelectedStyle] = useState('');
  const { data, isLoading, isFetching, refetch } = usePrompts({
    style: selectedStyle.toLowerCase(),
  });
  // Messaging state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  // For the cycling welcome text
  const [displayText, setDisplayText] = useState('CringeAI');
  const [fade, setFade] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();

  // Get user and model information
  const user = useUser();
  const { model } = useModelStore();

  // Mutation that sends a message and then streams the assistant’s reply.
  // Now we build the payload with all the fields your API expects.
  const mutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user) throw new Error('Authentication required');

      // Build the payload with the desired properties.
      const payload = {
        content: message,
        // For a new conversation leave this undefined (the API will assign one)
        conversation_uuid: undefined,
        role: 'user',
        user: user?.id,
        model: model?.model,
        name: model?.name,
        provider: model?.provider,
        images: [] as string[],
      };

      setIsGenerating(true);
      abortControllerRef.current = new AbortController();

      // Update local messages to show the user message and add an assistant placeholder.
      setMessages(prev => [
        ...prev,
        {
          content: message,
          role: 'user',
          created_at: new Date().toISOString()
        },
        {
          content: '',
          role: 'assistant',
          created_at: new Date().toISOString()
        },
      ]);

      try {
        await api.streamCompletion(
          payload,
          (chunk: string) => {
            // Append chunks to the last (assistant) message.
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant') {
                newMessages[newMessages.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + chunk,
                };
              }
              return newMessages;
            });
          },
          abortControllerRef.current.signal
        );
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    },
    onError: (error: any) => {
      if (error.name === 'AbortError') {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + ' [cancelled]',
            };
          }
          return newMessages;
        });
      } else {
        console.error('Chat error:', error);
        setMessages(prev => [
          ...prev,
          {
            content: 'Sorry, there was an error processing your request.',
            role: 'assistant',
            created_at: new Date().toISOString(),
          },
        ]);
      }
      setIsGenerating(false);
    },
  });

  const handleMessage = (message: string) => {
    if (isGenerating) return;
    if (!chatStarted) setChatStarted(true);
    mutation.mutate(message);
  };

  // Optional: listen for conversation creation events to auto-navigate.
  useEffect(() => {
    const handleConversationCreated = (event: CustomEvent) => {
      const uuid = event.detail.uuid;
      navigate(`/?c=${uuid}`, { replace: true });
    };
    window.addEventListener('conversation-created', handleConversationCreated as EventListener);
    return () => {
      window.removeEventListener('conversation-created', handleConversationCreated as EventListener);
    };
  }, [navigate]);

  // Cycle through welcome texts every 5 seconds.
  useEffect(() => {
    const texts = ['CringeAI', 'Perfection', 'Novelty', 'Euphoria', 'CringeAI', 'Excellence', 'Nirvana'];
    const cycle = () => {
      setFade(false);
      setTimeout(() => {
        setDisplayText(prev => {
          const nextIndex = (texts.indexOf(prev) + 1) % texts.length;
          return texts[nextIndex];
        });
        setFade(true);
      }, 200);
    };
    const interval = setInterval(cycle, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full bg-background">
      <AnimatePresence>
        {!chatStarted && (
          <motion.div
            key="landing-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 50 }}
            className="flex flex-col items-center justify-center h-full space-y-8 px-4"
          >
            {/* Welcome text */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="flex justify-center items-baseline gap-2 font-bold text-5xl">
                Welcome to{' '}
                <span
                  className={`text-primary transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
                >
                  {displayText}
                </span>
              </div>
              <div className="mt-2 font-semibold text-muted-foreground text-xl">
                How can I help you today{user?.data?.username ? `, ${user.data.username}?` : '?'}
              </div>
            </motion.div>

            {/* Conversation style selection chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full max-w-4xl"
            >
              <h2 className="mb-4 font-semibold text-md text-muted-foreground">
                Choose your conversation style
              </h2>
              <div className="gap-4 grid grid-cols-2 sm:grid-cols-4 mb-10">
                {promptStyles.map(style => (
                  <Button
                    key={style.name}
                    variant={selectedStyle === style.name ? 'default' : 'outline'}
                    className="flex justify-center items-center gap-2 h-12"
                    onClick={() => setSelectedStyle(style.name)}
                  >
                    {style.icon}
                    {style.name}
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Centered ChatInput */}
            <motion.div layout className="w-full max-w-4xl">
              <ChatInput
                onSubmit={handleMessage}
                disabled={isGenerating}
                messages={messages}
              />
            </motion.div>

            {/* Canned Questions chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-2 justify-center mt-4"
            >
              {!data || isLoading || isFetching ? (
                <Skeleton className="w-16 h-6" />
              ) : (
                data.prompts.map((item, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleMessage(item.prompt)}
                  >
                    {item.title}
                  </Button>
                ))
              )}
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCcw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatStarted && (
          <motion.div
            key="chat-mode"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            <ChatInput
              onSubmit={handleMessage}
              disabled={isGenerating}
              messages={messages}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};