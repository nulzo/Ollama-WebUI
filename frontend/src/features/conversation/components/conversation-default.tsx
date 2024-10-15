import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.tsx';
import { usePrompts } from '../api/get-default-prompts';
import logo from '@/assets/cringelogomedium.svg';
import { useConversation } from '../hooks/use-conversation';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const ConversationDefault = () => {
  const { data, isLoading, error } = usePrompts();
  const { createNewConversation, submitMessage } = useConversation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) return <div>Loading prompts...</div>;
  if (error) return <div>Error loading prompts.</div>;

  console.log(data);

  const handlePromptClick = async (prompt: string) => {
    try {
      setIsProcessing(true);
      // Submit the selected prompt as the first message
      await submitMessage(prompt);
      // Navigation is handled within the `onSuccess` of the hook
    } catch (err) {
      console.error('Failed to create conversation and submit message:', err);
      // Optionally, display an error message to the user using a notification system
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="relative h-full flex flex-col my-auto flex-grow items-center justify-center">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <img src={logo} alt="CringeAI" className="size-20" />
        </div>
        <div className='text-2xl font-bold'>
          Welcome to CringeAI.
        </div>
        <div className='text-base font-normal text-muted-foreground'>
          You can use the prompts below to start a conversation with CringeAI.
        </div>
      </div>
      <div className="w-full max-w-4xl mt-16">
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 w-max">
            {data?.prompts.prompts.map((item, index) => (
              <Card
                key={index}
                className="w-[300px] mb-4 hover:border-primary bg-secondary/50 cursor-pointer flex flex-col shrink-0"
                onClick={() => handlePromptClick(item.prompt)}
                disabled={isProcessing}
              >
                <CardHeader className="flex-grow flex flex-col">
                  <CardTitle className="flex gap-1 mb-2 items-baseline">
                      <div
                        key={index}
                        className='flex font-bold text-primary'
                      >{item.title.split(' ')[0]}</div>
                      <div
                        key={index}
                        className='flex text-muted-foreground text-sm font-normal'
                      >{item.title.split(' ').slice(1).join(' ')}</div>
                  </CardTitle>
                  <CardDescription className="flex-grow text-xs text-muted-foreground">{item.prompt}</CardDescription>
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