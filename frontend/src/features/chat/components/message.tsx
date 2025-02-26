import { useMemo, useEffect, useState, useRef, memo } from 'react';
import MarkdownRenderer from '@/features/markdown/components/markdown.tsx';
import { Copy, FrownIcon, Heart, HeartCrack, Loader2, RefreshCw } from 'lucide-react';
import { Message as MessageType } from '@/features/chat/types/message';
import { BotIcon } from '@/features/chat/components/bot-icon.tsx';
import { formatDate } from '@/utils/format.ts';
import { motion } from 'framer-motion';
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
import { StandardModel } from '@/features/models/types/models.js';
import { streamingService } from '../services/streaming-service';
import { format } from 'date-fns';

// Define a simplified message type that matches what we need
interface SimplifiedMessageType {
  id: string;
  role: string;
  content: string;
  created_at: string;
  updated_at?: string;
  model?: string;
  name?: string;
  image_ids?: number[];
  is_liked?: boolean;
  conversation_uuid?: string;
  has_images?: boolean;
}

interface MessageProps {
  message: SimplifiedMessageType;
  isTyping?: boolean;
  isWaiting?: boolean;
  isLoading?: boolean;
}

// eslint-disable-next-line react/display-name
export const Message = memo<MessageProps>(
  ({ message, isTyping = false, isWaiting = false, isLoading = false }) => {
    const formattedDate = useMemo(() => {
      try {
        return format(new Date(message.created_at), 'h:mm a');
      } catch (e) {
        return '';
      }
    }, [message.created_at]);
    const { data: modelsData } = useModels();
    const { copy } = useClipboard();
    const [isLiked, setIsLiked] = useState(message.is_liked || false);
    const [isModelOnline] = useState(true);
    const [messageContent, setMessageContent] = useState('');

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
          messageId: message.id?.toString() || '',
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

      const lowerMessageModel = message.model.toLowerCase();

      // Helper to check if any model in the given provider's list has a matching name or display name.
      const checkModels = (modelsArray?: StandardModel[]) =>
        modelsArray
          ? modelsArray.some(
              m =>
                (m.name && m.name.toLowerCase() === lowerMessageModel) ||
                (m.model && m.model.toLowerCase() === lowerMessageModel)
            )
          : false;

      return (
        checkModels(modelsData.ollama) ||
        checkModels(modelsData.openai) ||
        checkModels(modelsData.google) ||
        checkModels(modelsData.anthropic)
      );
    }, [modelsData, message.model]);

    // Update local state when prop changes
    useEffect(() => {
      setIsLiked(message.is_liked || false);
    }, [message.is_liked]);

    // Update message content when it changes
    useEffect(() => {
      setMessageContent(message.content || '');
    }, [message.content]);

    // For assistant messages that are waiting or typing
    if (message.role === 'assistant' && (isWaiting || isTyping)) {
      return (
        <motion.div 
          className="flex flex-col gap-1 px-4 py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex gap-3 w-full max-w-[95%]">
            <div className="flex flex-col items-center mb-0">
              <BotIcon assistantId={0} isOnline={isModelOnline} modelName={message.model} />
            </div>
            <div className="flex flex-col w-full">
              <div className="flex items-baseline gap-1.5 mb-0.5 ml-1">
                <span className="font-medium text-primary text-sm">{message.name || 'Assistant'}</span>
                <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
              </div>

              <div className="p-2 rounded-xl rounded-tl">
                <div className="max-w-none prose prose-sm scroll-smooth">
                  {isWaiting ? (
                    <div className="bg-muted/30 px-4 py-3 rounded-xl rounded-tl">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs">{message.model || 'Assistant'} is thinking...</span>
                        <Loader2 className="size-3 animate-spin" />
                      </div>
                    </div>
                  ) : (
                    <div 
                      style={{ minHeight: `${streamingService.getState().contentHeight}px` }}
                    >
                      {messageContent ? (
                        <MarkdownRenderer markdown={messageContent} />
                      ) : (
                        <div className="h-6" />
                      )}
                      
                      <motion.div 
                        className="inline-flex items-center h-4 pl-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="typing-indicator">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </span>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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

    const showActions = !isTyping && !isLoading && message.role === 'assistant';

    if (message.is_error) {
      return (
        <>
          {message.role === 'assistant' ? (
            <div className="flex gap-3 w-full max-w-[95%]">
              <div className="flex flex-col items-center mb-0">
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div className="relative flex justify-center items-center bg-destructive rounded-lg w-10 h-10">
                        <FrownIcon
                          strokeWidth="2"
                          className="m-2 size-6 text-destructive-foreground"
                        />
                        <div className="-right-0.5 -bottom-0.5 absolute bg-destructive rounded-full ring-2 ring-background size-2.5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">
                      Status Code: {message.error?.error_code}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex flex-col w-full">
                <div className="flex items-baseline gap-1.5 mb-0.5 ml-1">
                  <span className="font-medium text-destructive text-sm">{message.name}</span>
                  <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
                </div>

                <div className="bg-destructive/10 mb-4 px-4 py-3 border-1 border-destructive rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 font-semibold text-destructive">
                      {message.error?.error_title}
                    </div>
                  </div>
                  <p className="mt-4 text-destructive text-sm">
                    {message.error?.error_description}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 px-4 py-2">
              <div className="flex flex-col items-end selection:bg-muted-foreground">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    return (
      <div className="flex flex-col gap-1 px-4 py-2">
        {message.role !== 'user' ? (
          // Bot message
          <motion.div 
            className="flex gap-3 w-full max-w-[95%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center mb-0">
              <BotIcon assistantId={0} isOnline={isModelOnline} modelName={message.model} />
            </div>

            <div className="flex flex-col w-full">
              <div className="flex items-baseline gap-1.5 mb-0.5 ml-1">
                <span className="font-medium text-primary text-sm">{message.name || 'Assistant'}</span>
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

                <div className="max-w-none prose prose-sm scroll-smooth">
                  {messageContent ? (
                    <div>
                      <MarkdownRenderer markdown={messageContent} />
                    </div>
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

                  <MessageDetails messageId={message?.id?.toString() || ''} />
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          // User message
          <motion.div 
            className="flex flex-col items-end selection:bg-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-baseline gap-2">
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
          </motion.div>
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

// Memoize the component to prevent unnecessary re-renders
export const MemoizedMessage = memo(Message);