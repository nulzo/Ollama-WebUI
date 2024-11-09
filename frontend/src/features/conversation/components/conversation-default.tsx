import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card.tsx';
import { usePrompts } from '../api/get-default-prompts';
import logo from '@/assets/cringelogomedium.svg';
import { useConversation } from '../hooks/use-conversation';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame } from 'lucide-react';
import { useUser } from '@/lib/auth';

export const ConversationDefault = () => {
  const { data, isLoading, isFetching } = usePrompts();
  const { submitMessage } = useConversation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const cardMap = [0, 1, 2, 3, 4];
  const [displayText, setDisplayText] = useState('CringeAI'); // Add this state
  const [fade, setFade] = useState(false);
  const user = useUser();

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
        <div className='text-muted-foreground font-semibold text-xl mt-1'>
          How can I help you today{user?.data?.username ? `, ${user?.data?.username}?` : '?'}
          {/* How can I help you today? */}
        </div>
      </div>
      <div className="relative max-w-4xl w-full mt-16">
        {!isFetching && !isLoading && (
          <div className='px-4 flex gap-1 items-baseline justify-start font-base text-muted-foreground text-xs'>
            <Flame className='size-3 text-primary' strokeWidth={3} /> Personalized Recommendations
          </div>
        )}
        {/* <div className='absolute h-full backdrop-blur bg-gradient-to-r from-transparent to-transparent z-[9000] w-[25%] right-0 top-0' /> */}
        <div className="w-full overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none scrollbar-none">
          <div className="flex gap-6 w-full snap-center p-4">
            {(isLoading || isFetching) && cardMap.map(idx => (
              <div
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
              </div>
            ))}
            {!isLoading && data && data?.prompts.prompts.map((item, index) => (
              <div
                key={index}
                className="group w-[250px] min-h-[150px] max-h-[150px] rounded-2xl mb-4 hover:border hover:border-primary border border-secondary bg-secondary/50 cursor-pointer flex flex-col shrink-0"
                onClick={() => handlePromptClick(item.prompt)}
              >
                <div className="relative flex-grow flex flex-col p-6">
                  <div className="flex gap-1 font-bold mb-2 items-baseline flex-nowrap">
                    <div className='font-bold text-primary text-nowrap'>
                      {item.title.split(' ')[0]}
                    </div>
                    <div className='text-foreground/75 text-nowrap font-semibold text-xs truncate'>
                      {item.title.split(' ').slice(1).join(' ')}
                    </div>
                  </div>
                  <div className="flex-grow text-xs text-muted-foreground h-full flex flex-col justify-between text-ellipsis">
                    <div>{item.prompt}</div>
                    {/* <div className='absolute text-xs bottom-3 right-8 font-semibold invisible group-hover:visible text-primary/50 flex gap-1 items-end'>Prompt <MoveRight className='size-3' /></div> */}
                  </div>
                </div>
              </div>
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