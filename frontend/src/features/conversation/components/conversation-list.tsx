import { useConversations } from "../api/get-conversations";
import { ConversationOptionsDropdown } from "./conversation-options-dropdown";

function ChatItem({ chat, uuid, updateURL }: any) {
    return (
        <div className="relative group">
            <button
                value={chat.uuid}
                className={`w-full flex items-center align-middle justify-between rounded-lg px-3 py-2 hover:bg-accent ${uuid === chat.uuid && 'text-foreground bg-accent'
                    }`}
                onClick={() => {
                    updateURL(`c=${chat.uuid || ''}`);
                }}
            >
                <div className="flex self-center items-center align-middle flex-1 min-w-0"> {/* Changed to min-w-0 */}
                    <div className="text-left self-center w-full truncate h-[20px]">
                        {chat.name || 'New Conversation'}
                    </div>
                </div>
            </button>
            <div
                className={`${uuid === chat.uuid ? 'opacity-100' : 'opacity-0'} cursor-pointer h-7 group-hover:opacity-100 z-0 from-accent absolute right-[10px] top-[6px] py-1 pr-2 pl-5 bg-gradient-to-l from-80% to-transparent`}
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

    return (
        <>
            <div className="mb-2 flex justify-start text-sm align-middle items-center gap-2 px-2 text-muted-foreground">
                <span className="whitespace-nowrap text-xs cursor-default select-none">Recent Chats</span> 
            </div>
            <div className="space-y-1">
                {conversations?.map((conversation) => (
                    <ChatItem 
                        chat={conversation}
                        uuid={conversation.uuid}
                    />
                ))}
            </div>
        </>
    );
};