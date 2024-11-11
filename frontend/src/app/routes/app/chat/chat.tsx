import { ConversationArea } from '@/features/conversation/components/conversation-area';
import { ConversationAreaHeader } from '@/features/conversation/components/conversation-area-header.tsx';
import { MessagesList } from '@/features/message/components/message-list.tsx';
import { ConversationDefault } from '@/features/conversation/components/conversation-default.tsx';
import useScrollToEnd from '@/hooks/use-scroll-to-end.ts';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { useConversation } from '@/features/conversation/hooks/use-conversation';
import ConversationHistory from '@/features/conversation/components/conversation-history.tsx';

export function ChatRoute() {
  const { conversationId, messages, createNewConversation, submitMessage, setSearchParams } =
    useConversation();

  const ref = useScrollToEnd(messages.data);

  const handleSubmit = (text: string, image: string | null) => {
    submitMessage(text, image);
  };

  return (
    <>
      <div className="transition relative w-full max-w-full flex flex-col">
        <ConversationAreaHeader />
        <div className="transition relative flex flex-col flex-auto h-full z-10">
          <ConversationArea>
            {conversationId ? (
              <>
                <MessagesList conversation_id={conversationId} />
                <div ref={ref} />
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
    </>
  );
}
