import { ConversationArea } from '@/features/conversation/components/conversation-area';
import { ConversationAreaHeader } from '@/features/conversation/components/conversation-area-header.tsx';
import { MessagesList } from '@/features/message/components/message-list.tsx';
import { ConversationDefault } from '@/features/conversation/components/conversation-default.tsx';
import useScrollToEnd from '@/hooks/use-scroll-to-end.ts';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { useConversation } from '@/features/conversation/hooks/use-conversation';
import { useState } from 'react';

export function ChatRoute() {
  const { conversationId, messages, submitMessage } = useConversation();
  const [streamingContent, setStreamingContent] = useState('');
  const ref = useScrollToEnd(messages.data ?? [], streamingContent);
  
  const handleSubmit = (text: string, image: string | null) => {
    submitMessage(text, image);
  };

  const handleStreamingUpdate = (content: string) => {
    setStreamingContent(content);
  };

  return (
    <div className="transition relative w-full max-w-full flex flex-col h-screen">
      <ConversationAreaHeader />
      <div className="transition relative flex flex-col flex-1 overflow-hidden">
        <ConversationArea>
          {conversationId ? (
            <>
              <MessagesList conversation_id={conversationId} onStreamingUpdate={handleStreamingUpdate} />
              <div ref={ref} className="h-0" />
            </>
          ) : (
            <ConversationDefault />
          )}
        </ConversationArea>
        <div className="pb-4 pt-4 transition backdrop-blur">
          <ChatInput onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}