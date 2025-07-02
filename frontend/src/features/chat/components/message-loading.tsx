import { Skeleton } from '@/components/ui/skeleton';
import { Message } from '../types/message';

interface MessageLoadingProps {
  message: Message;
}

export const MessageLoading = ({ message }: MessageLoadingProps) => {
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
}; 