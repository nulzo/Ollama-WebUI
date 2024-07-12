import React from 'react';
import MarkdownRenderer from '../helpers/markdown.tsx';
import { Origami, Ghost } from 'lucide-react';
import LoadingSpinner from '@/components/loadingSpinner.tsx';

interface IBotMessage {
  username: string;
  message: string;
  isBot: boolean;
  isTyping: boolean;
}

const BotMessage: React.FC<IBotMessage> = (
    { username, message, isBot, isTyping }
) => {
  return (
    <div className={`py-2 flex place-items-start ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className="pt-4 pe-2 font-bold flex items-center mb-2">
        {isBot && (
          <div className="p-2 bg-accent rounded-full">
            <Origami strokeWidth="3" className="size-5 text-primary-foreground" />
          </div>
        )}
      </div>
      <div>
        <span className={`text-sm font-semibold p-1 flex place-items-start ${isBot ? 'justify-start' : 'justify-end'}`}>{username}</span>
        <div className={`py-3 ${isBot ? 'max-w-[75%] bg-accent/75 rounded-e-2xl rounded-b-2xl' : 'bg-primary/25 rounded-s-2xl rounded-b-2xl'}`}>
          <div className="px-5 flex items-center w-full m-0 border-0">
            {isTyping && (message.length <= 1 || !message || message === "<empty string>") ? (
              <LoadingSpinner color="#fb923c" />
            ) : (
              <MarkdownRenderer markdown={message.trim()} />
            )}
          </div>
        </div>
      </div>
      <div className="pt-4 ps-2 font-bold flex items-center mb-2">
        {!isBot && (
          <div className="p-2 bg-primary rounded-full">
            <Ghost strokeWidth="3" className="size-5 text-primary-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};

export default BotMessage;
