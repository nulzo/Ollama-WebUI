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
    <div className={`py-3 flex place-items-start ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className="pt-4 pe-1 font-bold flex items-center mb-2">
        {isBot && (
          <div className="p-2 bg-accent rounded-lg rounded-tr-none">
            <Origami strokeWidth="3" className="size-5 text-primary-foreground" />
          </div>
        )}
      </div>
      <div>
        <span className={`text-xs font-bold flex place-items-start ${isBot ? 'justify-start text-muted-foreground' : 'justify-end text-primary/75'}`}>
          {username}
        </span>
        <div className={`py-4 ${isBot ? 'max-w-[75%] bg-accent/75 rounded-e-2xl rounded-b-2xl' : 'bg-primary/25 rounded-s-2xl rounded-b-2xl'}`}>
          <div className="px-6 flex items-center w-full m-0 border-0">
            {isTyping && (message.length <= 1 || !message || message === "<empty string>") ? (
              <LoadingSpinner color="#fb923c" />
            ) : (
              <MarkdownRenderer markdown={message.trim()} />
            )}
          </div>
        </div>
      </div>
      <div className="pt-4 ps-1 font-bold flex items-center mb-2">
        {!isBot && (
          <div className="p-2 bg-primary rounded-lg rounded-tl-none">
            <Ghost strokeWidth="3" className="size-5 text-primary-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};

export default BotMessage;
