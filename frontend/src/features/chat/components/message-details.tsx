import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useMessage } from '../api/get-message';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/utils/format';

interface MessageDetailsProps {
  messageId: string;
}

export const MessageDetails: React.FC<MessageDetailsProps> = ({ messageId }) => {
  const { data: messageData, isLoading } = useMessage({ message_id: messageId });

  if (isLoading) {
    return <Skeleton className="w-4 h-4" />;
  }

  const message = messageData?.data;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          size="icon"
          className="w-7 text-muted-foreground hover:text-foreground"
        >
          <DotsHorizontalIcon className="w-3.5 h-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="gap-4 grid">
          <div className="gap-2 grid">
            <div className="items-center gap-4 grid grid-cols-3">
              <span className="font-medium text-sm">Created</span>
              <span className="col-span-2 text-muted-foreground text-sm">
                {message?.created_at ? formatDate(new Date(message.created_at).getTime()) : 'N/A'}
              </span>
            </div>
            <div className="items-center gap-4 grid grid-cols-3">
              <span className="font-medium text-sm">Model</span>
              <span className="col-span-2 text-muted-foreground text-sm">{message?.model}</span>
            </div>
            <div className="items-center gap-4 grid grid-cols-3">
              <span className="font-medium text-sm">Tokens</span>
              <span className="col-span-2 text-muted-foreground text-sm">
                {message?.tokens_used}
              </span>
            </div>
            <div className="items-center gap-4 grid grid-cols-3">
              <span className="font-medium text-sm">Generation</span>
              <span className="col-span-2 text-muted-foreground text-sm">
                {message?.generation_time?.toFixed(2)}s
              </span>
            </div>
            {message?.total_cost && (
              <div className="items-center gap-4 grid grid-cols-3">
                <span className="font-medium text-sm">Cost</span>
                <span className="col-span-2 text-muted-foreground text-sm">
                  ${message.total_cost}
                </span>
              </div>
            )}
            <div className="items-center gap-4 grid grid-cols-3">
              <span className="font-medium text-sm">Finish Reason</span>
              <span className="col-span-2 text-muted-foreground text-sm">success</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
