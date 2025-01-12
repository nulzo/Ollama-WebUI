import { ConversationArea } from '@/features/chat/components/chat-area/conversation-area.tsx';
import { ConversationAreaHeader } from '@/features/chat/components/chat-area/conversation-area-header.tsx';
import { ChatContainer } from '@/features/chat/components/chat-container.tsx';
import { ConversationDefault } from '@/features/chat/components/default-chat/conversation-default.tsx';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useConversation } from '@/features/chat/hooks/use-conversation.ts';
import { useChatMutation } from '@/features/chat/hooks/use-chat-mutation';

export function ChatRoute() {
  const { conversation } = useConversation();
  const { mutation, isGenerating } = useChatMutation(conversation || undefined);

  const [searchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParamString && searchParamString !== conversation) {
      navigate(`/?c=${searchParamString}`);
    }
  }, [searchParamString, conversation]);

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
        <div className="bg-background mt-1 p-4">
          <ChatInput onSubmit={(content) => mutation.mutate(content)} disabled={isGenerating} />
        </div>
      </div>
    </div>
  );
}
