import { memo } from 'react';
import { Copy, Heart, HeartCrack, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useClipboard } from '@/hooks/use-clipboard';
import { MessageDetails } from './message-details';
import { cn } from '@/lib/utils';
import { Message } from '../types/message';

interface MessageActionsProps {
  message: Message;
  isLiked: boolean;
  handleLike: () => void;
  isUpdatePending: boolean;
}

export const MessageActions = memo(
  ({ message, isLiked, handleLike, isUpdatePending }: MessageActionsProps) => {
    const { copy } = useClipboard();

    return (
      <div className="flex items-center gap-2">
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
                  disabled={isUpdatePending}
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
      </div>
    );
  }
); 