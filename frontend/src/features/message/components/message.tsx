import React, { useMemo } from 'react';
import MarkdownRenderer from '@/features/markdown/components/markdown';
import { RefreshCw } from 'lucide-react';
import { Message as MessageType } from '@/features/message/types/message';
import { BotIcon } from '@/features/message/components/bot-icon';
import { formatDate } from '@/utils/format';
import { CopyButton } from '@/features/message/components/copy-message';
import { LikeButton } from './like-message';
import { EnhanceButton } from './enhance-button';
import { AsyncMessageImage } from './async-image';
import { useModels } from '@/features/models/api/get-models';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageProps extends Omit<MessageType, 'conversation_id'> {
  username: string;
  time: number;
  isTyping?: boolean;
  image_ids?: string[] | number[] | undefined;
  conversation_id: string;
  modelName: string;
  isLoading?: boolean;
}

export const Message: React.FC<MessageProps> = ({
  username,
  role,
  time,
  content,
  isTyping,
  modelName,
  image_ids = [],
  isLoading,
}) => {
  const formattedDate = formatDate(time);
  const { data: modelsData } = useModels();

  const isModelOnline = useMemo(() => {
    if (!modelsData || !modelName) return false;
    
    const isOllamaModel = modelsData.ollama?.models?.some(
      model => model.name?.toLowerCase() === modelName?.toLowerCase()
    );
    
    const isOpenAIModel = modelsData.openai?.some(
      model => model.id?.toLowerCase() === modelName?.toLowerCase()
    );
    
    return isOllamaModel || isOpenAIModel;
  }, [modelsData, modelName]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 px-4 py-2">
        <div className={`flex ${role !== 'user' ? 'gap-3 max-w-[85%]' : 'flex-col items-end'}`}>
          {role !== 'user' && (
            <div className="flex items-start mb-0">
              <Skeleton className="rounded-full size-8" />
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2 mb-0.5 ml-1">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-16 h-3" />
            </div>
            <div className={`px-4 py-3 rounded-xl ${
              role !== 'user' 
                ? 'bg-muted/30 rounded-tl' 
                : 'bg-primary rounded-tr-sm'
            }`}>
              <Skeleton className="w-[300px] h-16" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const messageContent = content?.trim() || '';
  const showActions = !isTyping && !isLoading && role === 'assistant';

  return (
    <div className="flex flex-col gap-1 px-4 py-2">
      {role !== 'user' ? (
        // Bot message
        <div className="flex gap-3 max-w-[85%]">
          <div className="flex items-start mb-0">
            <BotIcon
              assistantId={0}
              isOnline={isModelOnline}
              modelName={modelName}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-2 mb-0.5 ml-1">
              <span className="font-medium text-primary text-sm">{modelName}</span>
              <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
            </div>

            <div className="bg-muted/30 px-4 py-3 rounded-xl rounded-tl">
              {image_ids.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <AsyncMessageImage
                    imageId={image_ids[0] as number}
                    images={image_ids as number[]}
                    currentIndex={0}
                  />
                </div>
              )}

              <div className="p-2 max-w-none prose prose-sm">
                {messageContent ? (
                  <MarkdownRenderer markdown={messageContent} />
                ) : (
                  <div className="h-6" /> // Placeholder for empty content
                )}
                {isTyping && (
                  <div className="flex h-4">
                    <div className="typing-indicator" />
                  </div>
                )}
              </div>
            </div>

            {showActions && (
              <div className="flex gap-1.5 mt-1.5 ml-2">
                <LikeButton content={messageContent} />
                <CopyButton content={messageContent} />
                <EnhanceButton content={messageContent} />
                <RefreshCw className="hover:cursor-pointer hover:stroke-foreground size-3.5 stroke-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      ) : (
        // User message
        <div className="flex flex-col items-end selection:bg-background/25">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
          </div>

          <div className="max-w-[70%]">
            {image_ids.length > 0 && (
              <div className="flex flex-wrap justify-end gap-2 mb-3">
                <AsyncMessageImage
                  imageId={image_ids[0] as number}
                  images={image_ids as number[]}
                  currentIndex={0}
                />
              </div>
            )}

            <div className="bg-primary selection:bg-background/40 px-4 py-3 rounded-xl rounded-tr-sm text-primary-foreground">
              <div className="max-w-none prose-invert prose prose-sm">
                {messageContent ? (
                  <MarkdownRenderer markdown={messageContent} />
                ) : (
                  <div className="h-6" /> // Placeholder for empty content
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};