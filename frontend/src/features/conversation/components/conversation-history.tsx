import { isToday, isThisWeek, isThisMonth, isBefore, subMonths } from 'date-fns';
import { PanelRightClose, PanelRightOpen, SquarePen } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Chat } from '@/services/provider/ollama/ollama.ts';
import { useEffect, useMemo, useState } from 'react';
import { useConversations } from '@/features/conversation/api/get-conversations';
import { ConversationOptionsDropdown } from './conversation-options-dropdown';

export default function ConversationHistory(props: any) {
  const chats = useConversations();
  const [isExpanded, setExpanded] = useState<boolean>(true);

  function createChat() {
    props.updateURL('');
    props.createChat();
    chats?.refetch();
  }

  useEffect(() => {
    if (chats?.data) {
      const names = {};
      chats.data.forEach((chat: Chat) => {
        names[chat.uuid] = chat.name || 'Unnamed conversation';
      });
    }
  }, [chats?.data]);

  async function getChatHistory(id: string) {
    if (!chats?.data) {
      console.log('No conversations found');
    }
    props.updateURL(`c=${id}`);
  }

  const getDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return 'Today';
    if (isThisWeek(date)) return 'Previous Week';
    if (isThisMonth(date)) return 'This Month';
    if (isBefore(date, subMonths(new Date(), 1))) return 'Last Month';
    return 'Older';
  };

  const skeleton = Array.from({ length: 19 }, (_, i) => (i + 1) / 2);

  const organizeChatsByDate = useMemo(() => {
    if (!chats?.data) return {};
    const groups = {};
    chats.data.forEach((chat: any) => {
      const label = getDateLabel(chat.created_at);
      groups[label] = groups[label] || [];
      groups[label].push(chat);
    });
    return groups;
  }, [chats]);

  if (!isExpanded) {
    return (
      <div className={`p-1 transform transition-transform duration-300 h-screen flex justify-between w-fit gap-2 px-4 py-2`}>
        <Button
          size="icon"
          variant="ghost"
          type="submit"
          className="font-bold mt-1"
          onClick={() => setExpanded(!isExpanded)}
        >
          <PanelRightClose className="size-4" />
        </Button>
      </div>
    );
  }
  
  if (chats.isLoading) {
    return (
      <>
        <div
          className={`max-h-[100dvh] w-[300px] max-w-[300px] min-h-screen select-none ease-in-out transform transition-transform duration-500 md:relative text-foreground text-sm fixed top-0 left-0 bg-secondary border-r ${isExpanded ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex px-2 py-2">
            <div className="flex pt-1 justify-between w-full items-center gap-2 px-2">
              <Button
                size="icon"
                variant="ghost"
                type="submit"
                className="font-bold"
                onClick={() => setExpanded(!isExpanded)}
              >
                <PanelRightOpen className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                type="submit"
                className="font-bold"
                onClick={() => {
                  createChat();
                }}
              >
                <SquarePen className="size-4" />
              </Button>
            </div>
          </div>
          <div className="px-2 pt-8 font-medium lg:ps-4 overflow-y-scroll scrollbar w-[100%] space-y-1 h-[90vh] max-h-[90vh]">
            {skeleton.reverse().map(idx => (
              <div className='z-50 h-8 rounded-lg bg-primary/10 w-full' style={{ opacity: idx * .10, animationDelay: `${idx * 100}ms`}} />
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div
        className={`max-h-[100dvh] min-w-[250px] w-[250px] max-w-[250px] min-h-screen select-none ease-in-out transform transition-transform duration-500 md:relative text-foreground text-sm fixed top-0 left-0 bg-secondary border-r ${isExpanded ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex px-2 py-2">
          <div className="flex pt-1 justify-between items-center w-full gap-2 px-2">
            <Button
              size="icon"
              variant="ghost"
              type="submit"
              className="font-bold"
              onClick={() => setExpanded(!isExpanded)}
            >
              <PanelRightOpen className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              type="submit"
              className="font-bold"
              onClick={() => {
                createChat();
              }}
            >
              <SquarePen className="size-4" />
            </Button>
          </div>
        </div>
        <div className="px-2 font-medium lg:ps-4  overflow-y-scroll scrollbar h-[90vh] max-h-[90vh]">
          {Object.entries(organizeChatsByDate)
            .reverse()
            .map(([group, groupChats]: any) => (
              <div key={group}>
                <div className="sticky top-0 py-2 text-xs font-semibold text-muted-foreground capitalize">
                  {group}
                </div>
                {groupChats.reverse().map((chat: Chat) => (
                  <div className="relative group">
                    <button
                      key={chat.uuid}
                      value={chat.uuid}
                      className={`truncate w-full flex justify-between rounded-lg px-3 py-2 hover:bg-accent ${props.uuid === chat.uuid && 'text-foreground bg-accent'
                        }`}
                      onClick={() => {
                        getChatHistory(chat.uuid || '');
                      }}
                    >
                      <div className="flex self-center flex-1 w-full">
                        <div className="text-left self-center overflow-hidden w-full h-[20px]">
                        {chat.name || (props.messages?.data?.length > 0 ? props.messages.data[0].content : 'New Conversation')}
                        </div>
                      </div>

                    </button>
                    <div className={`${props.uuid === chat.uuid ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 z-0 from-accent absolute right-[10px] top-[6px] py-1 pr-2 pl-5 bg-gradient-to-l from-80% to-transparent`}>
                      <ConversationOptionsDropdown conversationID={chat.uuid ?? ''} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
