import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card.tsx';
import { usePrompts } from '../api/get-default-prompts';
import logo from '@/assets/cringelogomedium.svg';
import { useConversation } from '../hooks/use-conversation';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, MoveRight, Send } from 'lucide-react';

export const ConversationDefault = () => {
  const { data, isLoading, isFetching } = usePrompts();
  const { submitMessage } = useConversation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const cardMap = [0, 1, 2, 3, 4];
  const [displayText, setDisplayText] = useState('CringeAI'); // Add this state
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const texts = ['CringeAI', 'Perfection', 'Novelty', 'Euphoria', 'CringeAI', 'Excellence', 'Nirvana'];
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setDisplayText(prev => {
          const nextIndex = (texts.indexOf(prev) + 1) % texts.length;
          return texts[nextIndex];
        });
        setFade(true);
      }, 200);
    }, 3500);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handlePromptClick = async (prompt: string) => {
    try {
      setIsProcessing(true);
      const newUuid = await submitMessage(prompt);
      if (newUuid) {
        navigate(`/chat/${newUuid}`);
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (err) {
      console.error('Failed to create conversation and submit message:', err);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="relative pt-8 h-full flex flex-col my-auto flex-grow items-center justify-center">
      <div className="max-w-4xl text-left mb-8 w-full">
        <div className="hidden gap-1 items-center justify-start mb-2">
          <img src={logo} alt="CringeAI" className="size-20" />
        </div>
        <div className='text-5xl font-bold flex gap-2 items-baseline'>
          Welcome to <div className={`text-primary transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>{displayText}</div>
        </div>
        <div className='text-muted-foreground text-lg mt-2'>
          You can use the prompts below to start a conversation with CringeAI.
        </div>
      </div>
      <div className="max-w-4xl w-full mt-16">
        {!isFetching && !isLoading && (
          <div className='px-4 flex gap-1 items-baseline justify-start font-base text-muted-foreground text-xs'>
            <Flame className='size-3 text-primary' strokeWidth={3} /> Personalized Recommendations
          </div>
        )}
        <div className="w-full overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
          <div className="flex gap-6 w-full snap-center p-4">
            {(isLoading || isFetching) && cardMap.map(idx => (
              <Card
                key={`skeleton-${idx}`}
                className="w-[300px] min-h-[150px] mb-4 bg-secondary/15 cursor-pointer flex flex-col shrink-0"
              >
                <CardHeader className="flex-grow flex flex-col">
                  <CardTitle className="flex gap-1 mb-2 items-baseline">
                    <Skeleton className="w-[80%] h-6" />
                  </CardTitle>
                  <CardDescription className="flex-grow text-xs text-muted-foreground">
                    <Skeleton className="w-full h-16" />
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
            {!isLoading && data && data?.prompts.prompts.map((item, index) => (
              <Card
                key={index}
                className="group w-[300px] mb-4 hover:ring-2 hover:ring-primary/20 hover:border-primary bg-secondary/50 cursor-pointer flex flex-col shrink-0"
                onClick={() => handlePromptClick(item.prompt)}
              >
                <CardHeader className="relative flex-grow flex flex-col">
                  <CardTitle className="flex gap-1 mb-2 items-baseline">
                    <span className='font-bold text-primary'>
                      {item.title.split(' ')[0]}
                    </span>
                    <span className='text-muted-foreground text-sm font-normal'>
                      {item.title.split(' ').slice(1).join(' ')}
                    </span>
                  </CardTitle>
                  <CardDescription className="flex-grow text-xs h-full text-muted-foreground flex flex-col justify-between pb-2">
                    <div>{item.prompt}</div>
                    <div className='absolute text-xs bottom-3 right-8 font-semibold invisible group-hover:visible text-primary/50 flex gap-1 items-end'>Prompt <MoveRight className='size-3' /></div>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
      {isProcessing && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">Processing...</div>
        </div>
      )}
    </div>
  );
};