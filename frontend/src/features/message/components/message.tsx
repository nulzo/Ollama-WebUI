import React from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';

interface MessageProps extends Omit<MessageType, 'conversation_id'> {
  username: string;
  time: number;
  isTyping: boolean;
  image?: string | null;
  conversation_id: string;
}

const Message: React.FC<MessageProps> = ({ username, role, time, content, isTyping, image }) => {
  const formattedDate = formatDate(time);
  const { getAssistantIdByName, isLoading, error, getAssistantByName } = useAssistants();
  let assistantId: number | undefined = undefined;
  let displayName: string = username;

  if (isLoading) return <div>Loading assistant data...</div>;

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

  if (image && !image?.startsWith('data:') && !image?.includes(';base64,')) {
    image = 'data:image/png;base64,' + image;
  }

  return (
<motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      className="py-3 w-full"
      layout="position" // Add this to maintain position during transitions
    >
      <div
        className={`text-sm items-baseline gap-1 py-0 my-0 pb-0 leading-none font-semibold flex place-items-start pl-6 ${role !== 'user' ? 'text-muted-foreground ps-11' : 'text-muted-foreground flex justify-end'}`}
      >
        {role !== 'user' && displayName}
        <span className="text-[10px] font-base text-muted-foreground/50">{formattedDate}</span>
      </div>
      <div
        className={`flex place-items-start ${role !== 'user' ? 'justify-start' : 'justify-end ps-[25%]'}`}
      >
        <div className="pe-2 font-bold flex items-center mb-2">
          {role !== 'user' && <BotIcon assistantId={assistantId ?? 0} />}
        </div>
        <div className={`${role !== 'user' ? 'max-w-[75%] min-w-[200px]' : ''}`}>
          <div
            className={`px-1 ${
              role !== 'user' 
                ? 'rounded-e-xl rounded-b-xl' 
                : 'pt-3 px-4 bg-primary/25 rounded-s-xl rounded-b-xl backdrop-blur'
            }`}
          >
            <div className="flex flex-col w-full m-0 border-0">
              <MarkdownRenderer markdown={content?.trim() ?? 'ERROR'} />
              {isTyping && (
                <div className="w-full h-4 flex items-center justify-start ps-2">
                  <div className="typing-indicator" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {role !== 'user' && (
        <div className="ms-12 flex gap-2">
          <LikeButton content={content?.trim() ?? ''} />
          <CopyButton content={content?.trim() ?? ''} />
          <EnhanceButton content={content?.trim() ?? ''} />
          <RefreshCw className="size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer" />
        </div>
      )}
    </motion.div>
  );
};

export default Message;
