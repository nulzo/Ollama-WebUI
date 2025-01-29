import { usePrompts } from '../../api/get-default-prompts';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, RefreshCcw, Send } from 'lucide-react';
import { useUser } from '@/lib/auth';
import { Sparkles, Brain, Lightbulb, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

const promptStyles = [
  { name: 'Creative', icon: <Sparkles className="w-4 h-4" /> },
  { name: 'Analytical', icon: <Brain className="w-4 h-4" /> },
  { name: 'Inspirational', icon: <Lightbulb className="w-4 h-4" /> },
  { name: 'Casual', icon: <Coffee className="w-4 h-4" /> },
];

interface Message {
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export const ConversationDefault = () => {
  const [selectedStyle, setSelectedStyle] = useState('');
  const { data, isLoading, isFetching, refetch } = usePrompts({
    style: selectedStyle.toLowerCase(),
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayText, setDisplayText] = useState('CringeAI');
  const [fade, setFade] = useState(true);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const user = useUser();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      setIsGenerating(true);
      abortControllerRef.current = new AbortController();

      // Add user message
      setMessages(prev => [...prev, {
        content: message,
        role: 'user',
        created_at: new Date().toISOString()
      }]);

      // Add empty assistant message
      setMessages(prev => [...prev, {
        content: '',
        role: 'assistant',
        created_at: new Date().toISOString()
      }]);

      try {
        await api.streamCompletion(
          {
            content: message,
          },
          (chunk) => {
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === 'assistant') {
                newMessages[newMessages.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + chunk
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
    onError: (error) => {
      if (error.name === 'AbortError') {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + ' [cancelled]'
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
            created_at: new Date().toISOString()
          }
        ]);
      }
      setIsGenerating(false);
    }
  });

  const handleMessage = (message: string) => {
    if (isGenerating) return;
    mutation.mutate(message);
  };

  useEffect(() => {
    const handleConversationCreated = (event: CustomEvent) => {
      const uuid = event.detail.uuid;
      navigate(`/?c=${uuid}`, { replace: true });
    };

    window.addEventListener('conversation-created', handleConversationCreated as EventListener);
    return () => {
      window.removeEventListener(
        'conversation-created',
        handleConversationCreated as EventListener
      );
    };
  }, [navigate]);

  useEffect(() => {
    const handleConversationCreated = (event: CustomEvent) => {
      const uuid = event.detail.uuid;
      navigate(`/?c=${uuid}`, { replace: true });
    };

    window.addEventListener('conversation-created', handleConversationCreated as EventListener);
    return () => {
      window.removeEventListener(
        'conversation-created',
        handleConversationCreated as EventListener
      );
    };
  }, [navigate]);

  useEffect(() => {
    const texts = [
      'CringeAI',
      'Perfection',
      'Novelty',
      'Euphoria',
      'CringeAI',
      'Excellence',
      'Nirvana',
    ];
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

  const handlePromptClick = (prompt: string) => handleMessage(prompt);

  return (
    <div className="relative flex flex-col justify-center items-center mt-auto p-4 sm:p-8 h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 w-full max-w-4xl text-center"
      >
        <div className="flex justify-center items-baseline gap-2 font-bold text-5xl">
          Welcome to{' '}
          <div
            className={`text-primary transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
          >
            {displayText}
          </div>
        </div>
        <div className="mt-1 font-semibold text-muted-foreground text-xl">
          How can I help you today{user?.data?.username ? `, ${user?.data?.username}?` : '?'}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-secondary/50 p-6 sm:p-8 rounded-2xl w-full max-w-4xl"
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

        <div className="flex justify-start items-center gap-2 mb-4 font-base text-muted-foreground text-sm">
          <Flame className="text-primary size-3" />
          <span className="font-medium text-xs">Personalized Recommendations</span>
        </div>

        {!data || isLoading || isFetching ? (
          <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map(index => (
              <motion.div
                key={`skeleton-${index}`}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center bg-secondary/15 backdrop-blur-xs p-4 rounded-lg h-[52px]"
              >
                <Skeleton className="w-full h-4" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
            {data.prompts.map((item, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => handleMessage(item.prompt)}
                className="flex justify-between items-center border-secondary/50 hover:border-primary/50 bg-secondary/20 hover:bg-secondary/30 hover:shadow-xs backdrop-blur-xs px-4 border rounded-lg h-[52px] transition-all duration-200 cursor-pointer ease-in-out group"
              >
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="font-semibold text-primary text-sm whitespace-nowrap">
                    {item.title.split(' ')[0]}
                  </span>
                  <span className="text-muted-foreground text-sm truncate">
                    {item.title.split(' ').slice(1).join(' ')}
                  </span>
                </div>
                <Send className="opacity-0 group-hover:opacity-100 w-3 h-3 text-primary/70 transition-opacity" />
              </motion.div>
            ))}

            <motion.div
              custom={data.prompts.length}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              onClick={() => refetch()}
              className="flex justify-between items-center border-secondary/50 hover:border-primary/50 bg-secondary/20 hover:bg-secondary/30 hover:shadow-xs backdrop-blur-xs px-4 border rounded-lg h-[52px] transition-all duration-200 cursor-pointer ease-in-out group"
            >
              <span className="text-muted-foreground text-sm truncate">
                Regenerate Recommendations
              </span>
              <RefreshCcw
                className={`w-3 h-3 text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity ${isFetching ? 'animate-spin' : ''}`}
              />
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
