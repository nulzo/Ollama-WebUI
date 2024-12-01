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
  isLoading,
}) => {
  const formattedDate = formatDate(time);
  let assistantId: number | undefined = undefined;
  const { data: modelsData } = useModels();

  const isModelOnline = useMemo(() => {
    if (!modelsData || !modelName) return false;
    
    // Check in Ollama models
    const isOllamaModel = modelsData.ollama?.models?.some(
      model => model.name?.toLowerCase() === modelName?.toLowerCase()
    );
    
    // Check in OpenAI models
    const isOpenAIModel = modelsData.openai?.some(
      model => model.id?.toLowerCase() === modelName?.toLowerCase()
    );
    
    return isOllamaModel || isOpenAIModel;
  }, [modelsData, modelName]);

  if (isLoading) {
    return <div className="flex flex-col gap-2 pb-4" />;
  }

  return (
    <div className="flex flex-col gap-1 px-4 py-2">
      {role !== 'user' ? (
        // Bot message
        <div className="flex gap-3 max-w-[85%]">
          <div className="flex items-start mb-0">
            <BotIcon
              assistantId={assistantId ?? 0}
              isOnline={isModelOnline}
              modelName={modelName}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-medium text-primary text-sm">{modelName}</span>
              <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
            </div>

            <div className="bg-muted/30 px-4 py-3 rounded-lg">
              {image_ids.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <AsyncMessageImage
                    imageId={image_ids[0] as number}
                    images={image_ids as number[]}
                    currentIndex={0}
                  />
                </div>
              )}

              <div className="max-w-none prose prose-sm">
                <MarkdownRenderer markdown={content?.trim() ?? 'ERROR'} />
                {isTyping && (
                  <div className="flex h-4">
                    <div className="typing-indicator" />
                  </div>
                )}
              </div>
            </div>

            {!isTyping && (
              <div className="flex gap-1.5 mt-1.5">
                <LikeButton content={content?.trim() ?? ''} />
                <CopyButton content={content?.trim() ?? ''} />
                <EnhanceButton content={content?.trim() ?? ''} />
                <RefreshCw className="size-3.5 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer" />
              </div>
            )}
          </div>
        </div>
      ) : (
        // User message
        <div className="flex flex-col items-end">
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

            <div className="bg-primary/75 px-4 py-3 rounded-lg text-primary-foreground">
              <div className="max-w-none prose-invert prose prose-sm">
                <MarkdownRenderer markdown={content?.trim() ?? 'ERROR'} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};