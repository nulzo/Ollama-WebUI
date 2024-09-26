import React from 'react';
import MarkdownRenderer from '@/features/markdown/components/markdown';
import { Sparkles, Heart, RefreshCw } from 'lucide-react';
import { Message as MessageType } from '@/features/message/types/message';
import { BotIcon } from '@/features/message/components/bot-icon';
import { formatDate } from '@/utils/format';
import { CopyButton } from '@/features/message/components/copy-message';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { Image } from './image';

interface MessageProps extends MessageType {
  username: string;
  time: number;
  isTyping: boolean;
  image?: string | null;
}

const Message: React.FC<MessageProps> = ({ username, role, time, content, isTyping, image }) => {
  const formattedDate = formatDate(time);

  return (
    <div className="py-3">
      <MessageHeader username={username} isBot={role !== 'user'} formattedDate={formattedDate} />
      <MessageContent message={content} isBot={role !== 'user'} isTyping={isTyping} image={image} />
      {role !== 'user' && <MessageActions message={content} />}
    </div>
  );
};

const MessageHeader: React.FC<{ username: string; isBot: boolean; formattedDate: string }> = ({ username, isBot, formattedDate }) => (
  <span className={`text-sm items-baseline gap-1 py-0 my-0 pb-1 leading-none font-semibold flex place-items-start pl-6 ${isBot ? 'text-muted-foreground ps-11' : 'text-muted-foreground flex justify-end'}`}>
    {isBot && username}
    <span className="text-[10px] font-base text-muted-foreground/50">
      {formattedDate}
    </span>
  </span>
);

const MessageContent: React.FC<{ message: string; isBot: boolean; isTyping: boolean; image?: string | null }> = ({ message, isBot, isTyping, image }) => 
{
  if (image && (!image?.startsWith('data:') && !image?.includes(';base64,'))) {
    image = "data:image/png;base64," + image;
  }
  return (
  <div className={`flex place-items-start ${isBot ? 'justify-start' : 'justify-end ps-[25%]'}`}>
    <div className="pe-2 font-bold flex items-center mb-2">{isBot && <BotIcon />}</div>
    <div className={`${isBot && 'max-w-[75%]'}`}>
      <div className={`px-1 ${isBot ? ' rounded-e-xl rounded-b-xl' : 'pt-3 px-4 bg-primary/25 rounded-s-xl rounded-b-xl backdrop-blur'}`}>
        <div className={`flex flex-col items-center w-full m-0 border-0 transition-opacity duration-300 ${isTyping ? 'opacity-0' : 'opacity-100'}`}>
          <MarkdownRenderer markdown={message?.trim() ?? 'ERROR'} />
          {image && 
            <Image src={image} />
          }
        </div>
      </div>
    </div>
  </div>
)};

const MessageActions: React.FC<{ message: string }> = ({ message }) => (
  <div className="ms-12 flex gap-2">
    <Heart className="size-3 stroke-muted-foreground hover:stroke-red-400 hover:cursor-pointer" />
    <CopyButton content={message?.trim() ?? ''} />
    <Sparkles className="size-3 stroke-muted-foreground hover:stroke-yellow-400 hover:cursor-pointer" />
    <RefreshCw className="size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer" />
  </div>
);

export default Message;