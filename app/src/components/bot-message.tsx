import React from 'react';
import MarkdownRenderer from '../helpers/markdown.tsx';
import { Origami, Copy, Sparkles, Heart, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/loadingSpinner.tsx';
import { formatDistanceToNow } from 'date-fns';

interface IBotMessage {
  username: string;
  message: string;
  isBot: boolean;
  isTyping: boolean;
  time: string;
}

function calculateAge(timestamp) {
  const date = new Date(timestamp);
  return formatDistanceToNow(date) + ' ago';
}

const BotMessage: React.FC<IBotMessage> = (
  { username, message, isBot, isTyping, time }
) => {
  return (
    <div className='py-3'>
      <div className={`flex place-items-start ${isBot ? 'justify-start' : 'justify-end'}`}>
        <div className="pe-1 font-bold flex items-center mb-2">
          {isBot && (
            <div className="p-2 bg-accent rounded-lg rounded-tr-none">
              <Origami strokeWidth="2" className="size-5 text-primary-foreground" />
            </div>
          )}
        </div>
        <div className={`${isBot && 'max-w-[75%]'}`}>
          <div className={`pt-3 pb-4 ${isBot ? 'bg-accent/75 rounded-e-2xl rounded-b-2xl' : 'bg-primary/25 rounded-s-2xl rounded-b-2xl'}`}>
            <span className={`pb-2 text-sm items-baseline gap-1 font-semibold flex place-items-start pl-6 ${isBot ? 'text-muted-foreground' : 'hidden'}`}>
              {username} <span className='text-xs font-light'>{time ? calculateAge(time) : "just now"}</span>
            </span>
            <div className="px-6 flex items-center w-full m-0 border-0">
              {isTyping && (message.length <= 1 || !message || message === "<empty string>") ? (
                <LoadingSpinner color="#fb923c" />
              ) : (
                <MarkdownRenderer markdown={message.trim()} />
              )}
            </div>
          </div>
        </div>
      </div>
      {isBot && (
        <div className='ms-12 mt-1.5 flex gap-2'>
          <Heart className='size-3 stroke-muted-foreground hover:stroke-red-400 hover:cursor-pointer' />
          <Copy className='size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer' />
          <Sparkles className='size-3 stroke-muted-foreground hover:stroke-yellow-400 hover:cursor-pointer' />
          <RefreshCw className='size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer' />
        </div>
      )}
    </div>
  );
};

export default BotMessage;
