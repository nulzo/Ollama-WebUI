import React, { useMemo } from 'react';
import MarkdownRenderer from '@/features/markdown/components/markdown';
import { RefreshCw } from 'lucide-react';
import { Message as MessageType } from '@/features/message/types/message';
import { BotIcon } from '@/features/message/components/bot-icon';
import { formatDate } from '@/utils/format';
import { CopyButton } from '@/features/message/components/copy-message';
import { Image } from './image';
import { LikeButton } from './like-message';
import { EnhanceButton } from './enhance-button';
import { useAssistants } from '@/features/assistant/hooks/use-assistant';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageProps extends Omit<MessageType, 'conversation_id'> {
  username: string;
  time: number;
  isTyping: boolean;
  images?: string[]; // Changed from image?: string | null
  conversation_id: string;
}

const Message = React.memo(({
  username,
  role,
  time,
  content,
  isTyping,
  images = []
}: MessageProps) => {
  const formattedDate = formatDate(time);
  const { getAssistantIdByName, isLoading, error, getAssistantByName } = useAssistants();
  let assistantId: number | undefined = undefined;
  let displayName: string = username;
  const memoizedContent = useMemo(() => {
    return content?.trim() ?? 'ERROR';
  }, [content]);

  const processedImages = Array.isArray(images) ? images : images ? [images] : [];

  if (isLoading) return (
    <div className="py-3 w-full">
      <Skeleton className="w-full h-4" />
    </div>
  )

  if (role !== 'user' && !isLoading && !error && username) {
    const assistant = getAssistantByName(username);
    if (assistant) {
      assistantId = assistant.id;
      displayName = assistant.display_name || assistant.name || username;
    }
  }

  if (role !== 'user' && !isLoading && !error && username) {
    assistantId = getAssistantIdByName(username);
  }

  return (
    <div className="py-3 w-full">
      <div className="max-w-[75%] min-w-[200px] relative">
        <div className={`flex flex-col ${role !== 'user' ? 'items-start' : 'items-end ml-auto'}`}>
          <div className="flex items-baseline gap-1 text-sm font-semibold text-muted-foreground">
            {role !== 'user' && <span>{displayName}</span>}
            <span className="text-[10px] font-base text-muted-foreground/50">{formattedDate}</span>
          </div>
          
          {processedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {processedImages.map((imageUrl, index) => (
                <Image
                  key={index}
                  src={imageUrl}
                  images={processedImages}
                  currentIndex={index}
                />
              ))}
            </div>
          )}

          <div className="flex items-start gap-2">
            {role !== 'user' && (
              <div className="flex-shrink-0">
                <BotIcon assistantId={assistantId ?? 0} />
              </div>
            )}
            
            <div className={`overflow-hidden ${role === 'user' ? 'bg-primary/25 rounded-s-xl rounded-b-xl p-4' : 'rounded-e-xl rounded-b-xl'}`}>
              <MarkdownRenderer markdown={memoizedContent} />
              {isTyping && (
                <div className="h-4 flex items-center ps-2">
                  <div className="typing-indicator" />
                </div>
              )}
            </div>
          </div>

          {role !== 'user' && (
            <div className="flex gap-2 mt-1">
              <LikeButton content={content?.trim() ?? ''} />
              <CopyButton content={content?.trim() ?? ''} />
              <EnhanceButton content={content?.trim() ?? ''} />
              <RefreshCw className="size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Message;
