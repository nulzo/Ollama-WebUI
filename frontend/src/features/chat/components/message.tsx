import { useMemo, useEffect, useState, useRef, memo } from 'react';
import MarkdownRenderer from '@/features/markdown/components/markdown.tsx';
import { Copy, Heart, HeartCrack, Loader2, RefreshCw } from 'lucide-react';
import { Message as MessageType } from '@/features/chat/types/message';
import { BotIcon } from '@/features/chat/components/bot-icon.tsx';
import { formatDate } from '@/utils/format.ts';
import { motion, useMotionValue, animate } from 'framer-motion';
import { AsyncMessageImage } from './async-image.tsx';
import { useModels } from '@/features/models/api/get-models.ts';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { Button } from '@/components/ui/button.tsx';
import { TooltipContent } from '@/components/ui/tooltip.tsx';
import { TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { Tooltip } from '@/components/ui/tooltip.tsx';
import { TooltipProvider } from '@/components/ui/tooltip.tsx';
import { useClipboard } from '@/hooks/use-clipboard.ts';
import { MessageDetails } from './message-details.tsx';
import { useUpdateMessage } from '../api/update-message.ts';
import { cn } from '@/lib/utils.ts';
import { useQueryClient } from '@tanstack/react-query';

interface MessageProps {
  message: MessageType;
  isTyping?: boolean;
  isLoading?: boolean;
  isWaiting?: boolean;
}

// eslint-disable-next-line react/display-name
export const Message = memo<MessageProps>(
  ({ message, isTyping, isLoading, isWaiting }) => {
    const [displayedContent, setDisplayedContent] = useState('');
    const formattedDate = formatDate(new Date(message.created_at).getTime());
    const { data: modelsData } = useModels();
    const progress = useMotionValue(0);
    const previousContentRef = useRef(message.content || '');
    const { copy } = useClipboard();
    const [isLiked, setIsLiked] = useState(message.is_liked);

    const queryClient = useQueryClient();
    const updateMessage = useUpdateMessage();

    const handleLike = () => {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);

      // Optimistically update the messages in the infinite query cache
      queryClient.setQueryData(
        ['messages', { conversation_id: message.conversation_uuid }],
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((msg: any) =>
                msg.id === message.id ? { ...msg, is_liked: newIsLiked } : msg
              ),
            })),
          };
        }
      );

      // Make the API call
      updateMessage.mutate(
        {
          messageId: message.id.toString(),
          data: { is_liked: newIsLiked },
        },
        {
          // Revert on error
          onError: () => {
            queryClient.setQueryData(
              ['messages', { conversation_id: message.conversation_uuid }],
              (oldData: any) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  pages: oldData.pages.map((page: any) => ({
                    ...page,
                    data: page.data.map((msg: any) =>
                      msg.id === message.id ? { ...msg, is_liked: !newIsLiked } : msg
                    ),
                  })),
                };
              }
            );
          },
        }
      );
    };

    const isModelOnline = useMemo(() => {
      if (!modelsData || !message.model) return false;

      console.log(modelsData, message.model);

      const isOllamaModel = modelsData.ollama?.models?.some(
        model => model.name?.toLowerCase() === message.model?.toLowerCase()
      );

      const isOpenAIModel = modelsData.openai?.some(
        model => model[0][1].toLowerCase() === message.model?.toLowerCase()
      );

      return isOllamaModel || isOpenAIModel;
    }, [modelsData, message.model]);

    // Update the streaming effect to be smoother
    useEffect(() => {
      if (!isTyping) {
        setDisplayedContent(message.content || '');
        return;
      }

      if (message.content !== previousContentRef.current) {
        const newContent = message.content;
        const targetLength = newContent.length;

        // Animate the progress value from current to target length
        animate(progress, targetLength, {
          type: 'tween',
          duration: 0.5,
          ease: 'linear',
          onUpdate: latest => {
            setDisplayedContent(newContent.slice(0, Math.floor(latest)));
          },
        });
      }
      previousContentRef.current = message.content;
    }, [message.content, isTyping]);

    // Update local state when prop changes
    useEffect(() => {
      setIsLiked(message.is_liked);
    }, [message.is_liked]);

    if (isWaiting) {
      return (
        <div className="flex flex-col gap-1 px-4 py-2">
          <div className="flex gap-3 w-full max-w-[85%]">
            <div className="flex flex-col items-center mb-0">
              <BotIcon assistantId={0} isOnline={isModelOnline} modelName={message.model} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2 mb-0.5 ml-1">
                <span className="font-medium text-primary text-sm">{message.model}</span>
                <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
              </div>
              <div className="bg-muted/30 px-4 py-3 rounded-xl rounded-tl">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{message.model} is initializing...</span>
                  <Loader2 className="size-3 animate-spin" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col gap-1 px-4 py-2">
          <div
            className={`flex ${message.role !== 'user' ? 'gap-3 max-w-[85%]' : 'flex-col items-end'}`}
          >
            {message.role !== 'user' && (
              <div className="flex items-start mb-0">
                <Skeleton className="rounded-full size-8" />
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2 mb-0.5 ml-1">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-16 h-3" />
              </div>
              <div
                className={`px-4 py-3 rounded-xl ${
                  message.role !== 'user' ? 'bg-muted/30 rounded-tl' : 'bg-primary rounded-tr-sm'
                }`}
              >
                <Skeleton className="w-[300px] h-16" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    const messageContent = isTyping ? displayedContent : message.content || '';
    const showActions = !isTyping && !isLoading && message.role === 'assistant';

    return (
      <div className="flex flex-col gap-1 px-4 py-2">
        {message.role !== 'user' ? (
          // Bot message
          <div className="flex gap-3 w-full max-w-[95%]">
            <div className="flex flex-col items-center mb-0">
              <BotIcon assistantId={0} isOnline={isModelOnline} modelName={message.model} />
            </div>

            <div className="flex flex-col w-full">
              <div className="flex items-baseline gap-1.5 mb-0.5 ml-1">
                <span className="font-medium text-primary text-sm">{message.model}</span>
                <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
              </div>

              <div className="p-2 rounded-xl rounded-tl">
                {message.image_ids?.length && message.image_ids.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <AsyncMessageImage
                      imageId={message.image_ids[0] as number}
                      images={message.image_ids as number[]}
                      currentIndex={0}
                    />
                  </div>
                )}

                <div className="max-w-none prose prose-sm">
                  {messageContent ? (
                    <MarkdownRenderer markdown={messageContent} />
                  ) : (
                    <div className="h-6" />
                  )}
                </div>
              </div>

              {showActions && (
                <div className="flex mt-0 rounded-lg w-fit">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="link"
                          size="icon"
                          onClick={handleLike}
                          className={cn(
                            'w-7 hover:text-destructive',
                            isLiked ? 'text-destructive' : 'text-muted-foreground'
                          )}
                          disabled={updateMessage.isPending}
                        >
                          {isLiked ? (
                            <HeartCrack
                              className="hover:fill-background stroke-1 hover:stroke-3 w-3.5 h-3.5 hover:text-destructive"
                              strokeWidth={3}
                              fill="currentColor"
                            />
                          ) : (
                            <Heart className="w-3.5 h-3.5" strokeWidth={2.5} />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isLiked ? 'Unlike message' : 'Like message'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="link"
                          size="icon"
                          onClick={() => copy(message.content)}
                          className="w-7 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="link"
                          size="icon"
                          className="w-7 text-muted-foreground hover:text-foreground"
                        >
                          <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Regenerate message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <MessageDetails messageId={message?.id} />
                </div>
              )}
            </div>
          </div>
        ) : (
          // User message
          <div className="flex flex-col items-end selection:bg-muted-foreground">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
            </div>

            <div className="flex flex-col justify-end items-end w-full max-w-[70%]">
              {message.image_ids?.length && message.image_ids.length > 0 && (
                <div className="flex flex-wrap justify-end gap-2">
                  <AsyncMessageImage
                    imageId={message.image_ids[0] as number}
                    images={message.image_ids as number[]}
                    currentIndex={0}
                  />
                </div>
              )}

              <div className="bg-primary selection:bg-background/40 px-4 py-3 rounded-xl rounded-tr-sm w-fit text-primary-foreground">
                <motion.div className="prose-invert max-w-none prose markdown-prose prose-sm">
                  {messageContent.length > 0 ? (
                    <MarkdownRenderer markdown={messageContent} />
                  ) : (
                    <Skeleton className="w-[300px] h-16" />
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to optimize re-renders
    return (
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.is_liked === nextProps.message.is_liked &&
      prevProps.isTyping === nextProps.isTyping &&
      prevProps.isLoading === nextProps.isLoading
    );
  }
);
