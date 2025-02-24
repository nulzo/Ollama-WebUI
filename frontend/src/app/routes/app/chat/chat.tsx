import { ConversationArea } from '@/features/chat/components/chat-area/conversation-area.tsx';
import { ConversationAreaHeader } from '@/features/chat/components/chat-area/conversation-area-header.tsx';
import { ChatContainer } from '@/features/chat/components/chat-container.tsx';
import { ConversationDefault } from '@/features/chat/components/default-chat/conversation-default.tsx';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useConversation } from '@/features/chat/hooks/use-conversation';
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
  }, [searchParamString, conversation, navigate]);

  const handleSubmit = (message: string, images?: string[]) => {
    mutation.mutate({ message, images });
  };

  return (
    <div className="relative flex flex-col w-full max-w-full h-screen transition font-geist">
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
            // Let ConversationDefault handle the input (centered) and landing view
            <ConversationDefault />
          )}
        </ConversationArea>

        {/* Only render bottom ChatInput if there is an active conversation */}
        {searchParamString && (
          <div className="bg-background p-2 flex flex-col gap-2 items-center">
            <ChatInput onSubmit={handleSubmit} disabled={isGenerating} />
            <div className="flex text-xs text-muted-foreground items-center gap-1">
              <span>CringeGPT Never Makes Mistakes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}