import { BotIcon } from './bot-icon';
import { formatDate } from '@/utils/format';
import { Message } from '@/features/chat/types/message';

interface MessageHeaderProps {
  message: Message;
  isModelOnline: boolean;
  providerName?: string;
}

export const MessageHeader = ({ message, isModelOnline, providerName }: MessageHeaderProps) => {
  const formattedDate = formatDate(new Date(message.created_at).getTime());

  if (message.role === 'user') {
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
        <div className="flex items-baseline gap-1.5 mb-0.5 ml-1">
            <span className="font-medium text-primary text-sm">{message.name}</span>
            <span className="text-[10px] text-muted-foreground">{formattedDate}</span>
        </div>
    </div>
  );
}; 