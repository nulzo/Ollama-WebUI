import { useMemo, useEffect, useState, useRef, memo, forwardRef } from 'react';
import MarkdownRenderer from '@/features/markdown/components/markdown.tsx';
import { Copy, FrownIcon, Heart, HeartCrack, Loader2, RefreshCw, XCircle } from 'lucide-react';
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
import { CitationList } from './citation-list.tsx';
import { ToolCallList } from './tool-call-list.tsx';
import { addInlineCitations, forceInlineCitations } from '../utils/process-citations.ts';
import { useSettings } from '@/features/settings/api/get-settings';

import { MessageHeader } from './message-header';
import { MessageActions } from './message-actions';
import { MessageBody } from './message-body';
import { MessageError } from './message-error';
import { MessageLoading } from './message-loading';

// Helper to extract provider from model ID
const getProviderFromModel = (modelId: string): string | undefined => {
  if (!modelId) return undefined;
  // Assumes model ID format like "some-model-id-provider" or "provider/model-id"
  const parts = modelId.split(/[-/]/);
  return parts.length > 1 ? parts[0] : undefined;
};

interface MessageProps {
  message: MessageType;
  isTyping?: boolean;
  isLoading?: boolean;
  isWaiting?: boolean;
  isCancelled?: boolean;
}


/*
  Custom hook: useSmoothStreaming
  
  - targetText: the full text streamed in from the backend.
  - isTyping: when true, we animate the displayed text from its current length to targetText.length.
  
  This hook uses requestAnimationFrame to add characters at a fixed rate.
  
  When isTyping is false the full text is rendered immediately.
*/
const useSmoothStreaming = (targetText: string, isTyping: boolean, speed: number = 10): string => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const requestRef = useRef<number | null>(null);
  const previousTargetRef = useRef<string>('');
  const chunkSizeRef = useRef<number>(speed);
  
  useEffect(() => {
    // If not typing, show full text immediately and clean up
    if (!isTyping) {
      setDisplayedText(targetText);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      return;
    }
    
    // Reset if the target text has completely changed
    if (targetText && !targetText.startsWith(previousTargetRef.current)) {
      setDisplayedText('');
    }
    
    previousTargetRef.current = targetText;
    chunkSizeRef.current = speed;
    
    // More efficient animation approach with better cleanup
    const animate = () => {
      setDisplayedText(current => {
        if (current.length < targetText.length) {
          const nextChunk = targetText.slice(
            current.length, 
            Math.min(current.length + chunkSizeRef.current, targetText.length)
          );
          return current + nextChunk;
        }
        return current;
      });
      
      // Only schedule next frame if we haven't reached the end
      requestRef.current = null;
      
      // Check if we need to continue animation
      if (displayedText.length < targetText.length) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Only start a new animation frame if one isn't already running
    if (!requestRef.current && displayedText.length < targetText.length) {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    // Cleanup function
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [targetText, isTyping, speed, displayedText.length]);
  
  return displayedText;
};


// eslint-disable-next-line react/display-name
export const Message = memo(
  forwardRef<HTMLDivElement, MessageProps>(
    ({ message, isTyping, isLoading, isWaiting, isCancelled }, ref) => {
    const formattedDate = formatDate(new Date(message.created_at).getTime());
    const { data: modelsData } = useModels();
    const { copy } = useClipboard();
    const [isLiked, setIsLiked] = useState(message.is_liked);
    const { data: settingsData } = useSettings();
    const inlineCitationsEnabled = settingsData?.settings?.general?.inline_citations_enabled ?? true;

    console.log('Message component rendering:', {
      messageId: message.id,
      hasCitations: message.has_citations,
      citationsCount: message.citations?.length,
      inlineCitationsEnabled,
      hasToolCalls: message.tool_calls && message.tool_calls.length > 0,
      toolCallsCount: message.tool_calls?.length || 0
    });

    const queryClient = useQueryClient();
    const updateMessage = useUpdateMessage();
    // Use our new smooth streaming hook.
    const messageContent = message.content || '';
    
    const modelInfo = useMemo(() => {
      if (!modelsData || !message.model) return null;
      const allModels = Object.values(modelsData).flat();
      return allModels.find(m => m.model.toLowerCase() === message.model?.toLowerCase());
    }, [modelsData, message.model]);

    const providerName = modelInfo?.provider;
    const isModelOnline = !!modelInfo;
    
    // Format the message content to remove the [cancelled] marker
    const displayContent = useMemo(() => {
      let content = messageContent;
      if (isCancelled && typeof content === 'string' && content.endsWith('[cancelled]')) {
        content = content.replace('[cancelled]', '');
      }
      
      // Clean up problematic citation patterns before processing
      if (typeof content === 'string') {
        // Remove Unicode null characters
        content = content.replace(/\u0000/g, '');
        
        // Remove any trailing 'e:' that might be a partial citation marker
        content = content.replace(/e:$/g, '');
      }
      
      // Add inline citations if available and enabled in settings
      if (inlineCitationsEnabled && message.has_citations && message.citations && message.citations.length > 0) {
        console.log('Adding inline citations to message:', message.id);
        
        // Just clean the content without adding citation markers
        content = addInlineCitations(content, message.citations);
      } else if (message.has_citations && message.citations && message.citations.length > 0) {
        console.log('Inline citations disabled but message has citations:', {
          messageId: message.id,
          inlineCitationsEnabled,
          hasCitations: message.has_citations,
          citationsCount: message.citations.length
        });
      }
      
      return content;
    }, [messageContent, isCancelled, message.has_citations, message.citations, inlineCitationsEnabled]);

    const handleLike = () => {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);

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

      updateMessage.mutate(
        {
          messageId: message.id?.toString() || '',
          data: { is_liked: newIsLiked },
        },
        {
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

    useEffect(() => {
      setIsLiked(message.is_liked);
    }, [message.is_liked]);

    if (isWaiting) {
        return (
          <div className="flex flex-col gap-1 px-4 py-2">
            <div className="flex gap-3 w-full max-w-[85%]">
              <div className="flex flex-col items-center mb-0">
                <motion.div className="flex items-start gap-3">
                  <BotIcon
                    isOnline={isModelOnline}
                    modelName={message.model}
                    provider={providerName}
                  />
                </motion.div>
              </div>
              <div className="flex flex-col">
                <MessageHeader message={message} isModelOnline={isModelOnline} providerName={providerName} />
                <div className="bg-muted/30 px-4 py-3 rounded-xl rounded-tl">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-xs">{message.model} is initializing...</span>
                    <Loader2 className="size-3 animate-spin" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }

    if (isLoading) {
      return <MessageLoading message={message} />;
    }

    if (message.is_error) {
      return <MessageError message={message} />;
    }

    const showActions = !isTyping && !isLoading && message.role === 'assistant';

    return (
      <div className="flex flex-col gap-1 px-4 py-2" ref={ref}>
        {message.role !== 'user' ? (
          <div className="flex gap-3 w-full max-w-[95%]">
            <div className="flex flex-col items-center mb-0">
                <BotIcon
                isOnline={isModelOnline}
                modelName={message.model}
                provider={providerName}
                />
            </div>

            <div className="flex flex-col w-full">
              <MessageHeader message={message} isModelOnline={isModelOnline} providerName={providerName} />
              <MessageBody message={message} isTyping={!!isTyping} isCancelled={!!isCancelled} />
              {showActions && (
                <MessageActions 
                  message={message} 
                  isLiked={!!isLiked}
                  handleLike={handleLike} 
                  isUpdatePending={updateMessage.isPending}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-end selection:bg-muted-foreground">
            <MessageHeader message={message} isModelOnline={isModelOnline} providerName={providerName} />
            <div className="flex flex-col justify-end items-end w-full max-w-[70%]">
              <MessageBody message={message} isTyping={!!isTyping} isCancelled={!!isCancelled} />
            </div>
          </div>
        )}
      </div>
    );
  }),
  (prevProps, nextProps) => {
    return (
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.is_liked === nextProps.message.is_liked &&
      prevProps.isTyping === nextProps.isTyping &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.message.id === nextProps.message.id
    );
  }
);
