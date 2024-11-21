import { usePrompts } from '../api/get-default-prompts'; import { ChatInput } from '@/features/textbox/components/chat-input';
import { useConversation } from '../hooks/use-conversation';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, RefreshCcw, Send } from 'lucide-react';
import { useUser } from '@/lib/auth';
import { Sparkles, Brain, Lightbulb, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const promptStyles = [
  { name: 'Creative', icon: <Sparkles className="w-4 h-4" /> },
  { name: 'Analytical', icon: <Brain className="w-4 h-4" /> },
  { name: 'Inspirational', icon: <Lightbulb className="w-4 h-4" /> },
  { name: 'Casual', icon: <Coffee className="w-4 h-4" /> },
];

export const ConversationDefault = () => {
  const { data, isLoading, isFetching, refetch, isRefetching } = usePrompts();
  const { submitMessage } = useConversation();
  const [isProcessing, setIsProcessing] = useState(false);
  const cardMap = [0, 1, 2, 3, 4];
  const [displayText, setDisplayText] = useState('CringeAI');
  const [fade, setFade] = useState(true);
  const user = useUser();
  const [selectedStyle, setSelectedStyle] = useState('');
  const navigate = useNavigate();

  const handleMessage = async (message: string, image: string | null = null) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await submitMessage(message, image);
    } catch (err) {
      console.error('Failed to create conversation and submit message:', err);
    } finally {
      setIsProcessing(false);
    }
  };

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
    <div className="relative mt-auto h-full flex flex-col items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 w-full max-w-4xl"
      >
        <div className='text-5xl font-bold flex gap-2 items-baseline justify-center'>
          Welcome to <div className={`text-primary transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>{displayText}</div>
        </div>
        <div className='text-muted-foreground font-semibold text-xl mt-1'>
          How can I help you today{user?.data?.username ? `, ${user?.data?.username}?` : '?'}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-4xl bg-secondary/50 rounded-2xl p-6 sm:p-8"
      >
        <h2 className="text-md font-semibold text-muted-foreground mb-4">Choose your conversation style</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {promptStyles.map((style) => (
            <Button
              key={style.name}
              variant={selectedStyle === style.name ? "default" : "outline"}
              className="flex items-center justify-center gap-2 h-12"
              onClick={() => setSelectedStyle(style.name)}
            >
              {style.icon}
              {style.name}
            </Button>
          ))}
        </div>

        <div className='flex gap-2 items-center justify-start font-base text-muted-foreground text-sm mb-4'>
          <Flame className='size-3 text-primary' />
          <span className="font-medium text-xs">Personalized Recommendations</span>
        </div>

        {(!data || isLoading || isFetching) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <motion.div
                key={`skeleton-${index}`}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="h-[52px] p-4 rounded-lg bg-secondary/15 backdrop-blur-sm flex items-center"
              >
                <Skeleton className="w-full h-4" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.prompts.prompts.map((item, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => handleMessage(item.prompt)}
                className="group h-[52px] px-4 rounded-lg border border-secondary/50 hover:border-primary/50 bg-secondary/20 hover:bg-secondary/30 backdrop-blur-sm cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-between hover:shadow-sm"
              >
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    {item.title.split(' ')[0]}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">
                    {item.title.split(' ').slice(1).join(' ')}
                  </span>
                </div>
                <Send className="w-3 h-3 text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}

            <motion.div
              custom={data.prompts.prompts.length}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              onClick={() => refetch()}
              className="group h-[52px] px-4 rounded-lg border border-secondary/50 hover:border-primary/50 bg-secondary/20 hover:bg-secondary/30 backdrop-blur-sm cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-between hover:shadow-sm"
            >
              <span className="text-sm text-muted-foreground truncate">
                Regenerate Recommendations
              </span>
              <RefreshCcw className={`w-3 h-3 text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity ${isFetching ? 'animate-spin' : ''}`} />
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};