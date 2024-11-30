import React from 'react';
import MarkdownRenderer from '@/features/markdown/components/markdown';
import { RefreshCw } from 'lucide-react';
import { Message as MessageType } from '@/features/message/types/message';
import { BotIcon } from '@/features/message/components/bot-icon';
import { formatDate } from '@/utils/format';
import { CopyButton } from '@/features/message/components/copy-message';
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
      {role !== 'user' ? (
        // Bot message
        <div className="flex flex-col w-full">
          {/* Header with icon and name */}
          <div className="flex items-center gap-3 mb-0 ps-5">
            <BotIcon assistantId={assistantId ?? 0} />
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-primary text-sm">{modelName}</span>
              <span className="text-[10px] text-muted-foreground/50">{formattedDate}</span>
            </div>
          </div>
          
          {/* Content section */}
          <div className="w-full ps-11">
            {image_ids.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                <AsyncMessageImage
                  imageId={image_ids[0] as number}
                  images={image_ids as number[]}
                  currentIndex={0}
                />
              </div>
            )}
            <div className="px-1">
              <div className="flex flex-col items-center border-0 m-0 w-full">
                <MarkdownRenderer markdown={content?.trim() ?? 'ERROR'} />
                {isTyping && (
                  <div className="flex justify-start items-center w-full h-4 ps-2">
                    <div className="typing-indicator" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isTyping && (
            <div className="flex gap-2 mt-2 ms-12">
              <LikeButton content={content?.trim() ?? ''} />
              <CopyButton content={content?.trim() ?? ''} />
              <EnhanceButton content={content?.trim() ?? ''} />
              <RefreshCw className="size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer" />
            </div>
          )}
        </div>
      ) : (
        // User message (unchanged)
        <div className="flex flex-col gap-1">
          <div className="flex justify-end items-baseline gap-1 my-0 py-0 font-semibold text-muted-foreground text-sm leading-none">
            <span className="pb-0 font-base text-[10px] text-muted-foreground/50">{formattedDate}</span>
          </div>
          {image_ids.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2 ps-[25%]">
              <AsyncMessageImage
                imageId={image_ids[0] as number}
                images={image_ids as number[]}
                currentIndex={0}
              />
            </div>
          )}
          <div className="flex justify-end">
            <div className="bg-primary/25 px-4 pt-3 rounded-b-xl rounded-s-xl">
              <div className="flex flex-col items-center border-0 m-0 w-full">
                <MarkdownRenderer markdown={content?.trim() ?? 'ERROR'} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};