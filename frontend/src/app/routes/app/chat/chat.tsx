import { ConversationArea } from '@/features/conversation/components/conversation-area';
import { ConversationAreaHeader } from '@/features/conversation/components/conversation-area-header.tsx';
import { MessagesList } from '@/features/message/components/message-list.tsx';
import { ConversationDefault } from '@/features/conversation/components/conversation-default.tsx';
import useScrollToEnd from '@/hooks/use-scroll-to-end.ts';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { useConversation } from '@/features/conversation/hooks/use-conversation';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function ChatRoute() {
  const { conversationId, messages, submitMessage } = useConversation();
  const [streamingContent, setStreamingContent] = useState('');
  const ref = useScrollToEnd(messages.data?.data ?? [], streamingContent);
  const [searchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const navigate = useNavigate();

  const handleSubmit = (text: string, image: string[] | null) => {
    submitMessage(text, image);
  };

  const handleStreamingUpdate = (content: string) => {
    setStreamingContent(content);
  };

  useEffect(() => {
    if (searchParamString && searchParamString !== conversationId) {
      navigate(`/?c=${searchParamString}`);
    }
  }, [searchParamString, conversationId]);

  return (
    <div className="relative flex flex-col w-full max-w-full h-screen transition">
      <ConversationAreaHeader />
      <div className="relative flex flex-col flex-1 transition overflow-hidden">
        <ConversationArea>
          {searchParamString ? (
            <div className="flex flex-col min-h-full">
              <MessagesList
                conversation_id={searchParamString}
                onStreamingUpdate={handleStreamingUpdate}
              />
              <div ref={ref} className="h-0" />
            </div>
          ) : (
            <ConversationDefault />
          )}
        </ConversationArea>
        <div className="">
          <ChatInput onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}