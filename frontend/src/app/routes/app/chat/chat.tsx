import { ConversationArea } from '@/features/conversation/components/conversation-area';
import { useModelStore } from '@/features/models/store/model-store';
import ConversationHistory from '@/features/conversation/components/conversation-history.tsx';
import { ConversationAreaHeader } from '@/features/conversation/components/conversation-area-header.tsx';
import { MessagesList } from '@/features/message/components/message-list.tsx';
import { ConversationDefault } from '@/features/conversation/components/conversation-default.tsx';
import useScrollToEnd from '@/hooks/use-scroll-to-end.ts';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { useConversation } from '@/features/conversation/hooks/use-conversation';


export function ChatRoute() {
  const { conversationId, messages, createNewConversation, submitMessage, setSearchParams } = useConversation();
  const { model } = useModelStore(state => ({ model: state.model }));

  const ref = useScrollToEnd(messages.data);

  return (
    <>
      <ConversationHistory
        createChat={createNewConversation}
        uuid={conversationId}
        updateURL={setSearchParams}
        messages={messages}
      />
      <div className="transition relative w-full max-w-full flex flex-col">
        <ConversationAreaHeader />
        <div className="transition relative flex flex-col flex-auto z-10">
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
            <ChatInput onSubmit={submitMessage} />
          </div>
        </div>
      </div>
    </>
  );
}
