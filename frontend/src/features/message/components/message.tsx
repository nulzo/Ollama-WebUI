import React from 'react';
import MarkdownRenderer from '@/features/markdown/components/markdown';
import { RefreshCw } from 'lucide-react';
import { Message as MessageType } from '@/features/message/types/message';
import { BotIcon } from '@/features/message/components/bot-icon';
import { formatDate } from '@/utils/format';
import { CopyButton } from '@/features/message/components/copy-message';
import { Image } from './image';
import { LikeButton } from './like-message';
import { EnhanceButton } from './enhance-button';
import { AsyncMessageImage } from './async-image';

interface MessageProps extends Omit<MessageType, 'conversation_id'> {
  username: string;
  time: number;
  isTyping: boolean;
  image_ids?: string[] | number[] | undefined;
  conversation_id: string;
  modelName: string;
  isLoading: boolean;
}

export const Message: React.FC<MessageProps> = ({
  username,
  role,
  time,
  content,
  isTyping,
  modelName,
  image_ids = [],
  isLoading
}) => {
  const formattedDate = formatDate(time);
  let assistantId: number | undefined = undefined;

  if (isLoading) {
    return <div className="flex flex-col gap-2 pb-4">
      <div className="flex flex-col gap-2 pb-4">

      </div>
    </div>;
  }

  return (
    <div className="flex flex-col gap-1 pb-4">
      <div
        className={`text-sm items-baseline gap-1 py-0 my-0 leading-none font-semibold flex place-items-start pl-6 ${role !== 'user' ? 'text-primary ps-11' : 'text-muted-foreground flex justify-end'}`}
      >
        {role !== 'user' && modelName}
        <span className={`font-base text-[10px] text-muted-foreground/50 ${role === 'user' ? 'pb-0 flex justify-end' : ''}`}>{formattedDate}</span>
      </div>
      {image_ids.length > 0 && (
        <div className={`flex flex-wrap gap-2 place-items-start items-center align-middle ${role !== 'user' ? 'justify-start' : 'justify-end ps-[25%]'}`}>
          <AsyncMessageImage
            imageId={image_ids[0] as number}
            images={image_ids as number[]}
            currentIndex={0}
          />
        </div>
      )}
      <div
        className={`flex place-items-start ${role !== 'user' ? 'justify-start' : 'justify-end ps-[25%]'}`}
      >
        <div className="flex items-center mb-2 font-bold pe-2">
          {role !== 'user' && <BotIcon assistantId={assistantId ?? 0} />}
        </div>
        <div className={`${role !== 'user' ? 'w-[75%] flex items-center align-middle' : ''}`}>
          <div
            className={`px-1 ${role !== 'user'
              ? 'rounded-e-xl rounded-b-xl'
              : 'pt-3 px-4 bg-primary/25 rounded-s-xl rounded-b-xl backdrop-blur'
              }`}
          >
            <div className="flex flex-col items-center border-0 m-0 w-full align-middle">
              <MarkdownRenderer markdown={content?.trim() ?? 'ERROR'} />
              {isTyping && (
                <div className="flex justify-start items-center w-full h-4 ps-2">
                  <div className="typing-indicator" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {role !== 'user' && !isTyping && (
        <div className="flex gap-2 ms-12">
          <LikeButton content={content?.trim() ?? ''} />
          <CopyButton content={content?.trim() ?? ''} />
          <EnhanceButton content={content?.trim() ?? ''} />
          <RefreshCw className="size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer" />
        </div>
      )}
    </div>
  );
};
