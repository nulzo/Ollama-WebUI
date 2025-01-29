import { useNavigate } from 'react-router-dom';
import { useConversations } from '../../api/get-conversations.ts';
import { ConversationOptionsDropdown } from './conversation-options-dropdown.tsx';
import { useSearchParams } from 'react-router-dom';

function ChatItem({ chat, uuid, updateURL }: any) {
  return (
    <div className="relative hover:bg-tertiary/75 rounded-lg group">
      <button
        value={chat.uuid}
        className={`w-full flex items-center align-middle justify-between rounded-lg px-3 py-2 hover:bg-tertiary/75 ${
          uuid === chat.uuid && 'text-foreground bg-tertiary'
        }`}
        onClick={() => {
          updateURL(`c=${chat.uuid || ''}`);
        }}
      >
        <div className="flex flex-1 items-center min-w-0">
          <div className="flex w-full min-w-0">
            <span className="text-sm truncate">{chat.name || 'New Conversation'}</span>
          </div>
        </div>
      </button>
      <div
        className={`${uuid === chat.uuid ? 'opacity-100' : 'opacity-0'} cursor-pointer h-7 group-hover:opacity-100 z-0 from-tertiary absolute right-[10px] top-[6px] py-1 pr-2 pl-5 bg-linear-to-l from-70% to-transparent`}
      >
        <ConversationOptionsDropdown
          name={chat.name}
          is_pinned={chat.is_pinned}
          conversationID={chat.uuid ?? ''}
        />
      </div>
    </div>
  );
}

export const ConversationList = () => {
  const { data: conversations } = useConversations();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeConversationId = searchParams.get('c') || '';

  const handleConversationClick = (uuid: string) => {
    navigate(`/?c=${uuid}`);
  };

  return (
    <>
      <div className="flex justify-start items-center gap-2 mb-2 px-2 text-muted-foreground text-sm align-middle">
        <span className="text-xs whitespace-nowrap cursor-default select-none">Recent Chats</span>
      </div>
      <div className="space-y-1">
        {conversations
          ?.slice()
          .reverse()
          .map(conversation => (
            <ChatItem
              key={conversation.uuid}
              chat={conversation}
              uuid={activeConversationId}
              updateURL={() => handleConversationClick(conversation.uuid)}
            />
          ))}
      </div>
    </>
  );
};
