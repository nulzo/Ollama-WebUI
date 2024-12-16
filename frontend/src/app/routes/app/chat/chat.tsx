// frontend/src/app/routes/app/chat/chat.tsx
import { ConversationArea } from '@/features/chat/components/chat-area/conversation-area.tsx';
import { ConversationAreaHeader } from '@/features/chat/components/chat-area/conversation-area-header.tsx';
import { ChatContainer } from '@/features/chat/components/chat-container.tsx';
import { ConversationDefault } from '@/features/chat/components/default-chat/conversation-default.tsx';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useConversation } from '@/features/chat/hooks/use-conversation.ts';

export function ChatRoute() {
  const { conversationId, submitMessage, isStreaming } = useConversation();
  const [searchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParamString && searchParamString !== conversationId) {
      navigate(`/?c=${searchParamString}`);
    }
  }, [searchParamString, conversationId]);

  const handleSubmit = (message: string, images: string[] | undefined) => {
    submitMessage(message, images);
  };

  return (
    <div className="relative flex flex-col w-full max-w-full h-screen transition">
      <ConversationAreaHeader />
      <div className="relative flex flex-col flex-1 transition overflow-hidden">
        <ConversationArea>
          {searchParamString ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-hidden">
                <ChatContainer conversation_id={searchParamString} />
              </div>
            </div>
          ) : (
            <ConversationDefault />
          )}
        </ConversationArea>
        <div className="bg-background p-4 border-t">
          <ChatInput onSubmit={handleSubmit} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}
