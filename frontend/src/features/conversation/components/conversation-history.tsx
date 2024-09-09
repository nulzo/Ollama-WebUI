import { isToday, isThisWeek, isThisMonth, isBefore, subMonths } from 'date-fns';
import { PanelRightClose, PanelRightOpen, Pen, Pin, SquarePen, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Chat } from '@/services/provider/ollama/ollama.ts';
import { useMemo, useState } from 'react';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConversations } from '@/features/conversation/api/get-conversations';

export default function ConversationHistory(props: any) {
  const chats = useConversations();
  const [isExpanded, setExpanded] = useState<boolean>(true);

  function createChat() {
    props.updateURL('');
    props.createChat();
    chats?.refetch();
  }

  async function getChatHistory(id: string) {
    props.getChatHistory(id);
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

  const organizeChatsByDate = useMemo(() => {
    if (!chats?.data) return {};
    const groups = {};
    chats.data.forEach((chat: any) => {
      const label = getDateLabel(chat.timestamp);
      groups[label] = groups[label] || [];
      groups[label].push(chat);
    });
    return groups;
  }, [chats]);

  if (!isExpanded) {
    return (
      <div className=" transition-transform h-screen flex justify-between w-fit gap-2 px-4 py-2">
        <Button
          size="icon"
          variant="ghost"
          type="submit"
          className="font-bold"
          onClick={() => setExpanded(!isExpanded)}
        >
          <PanelRightClose className="size-4" />
        </Button>
      </div>
    );
  }
  return (
    <>
      <div
        className={`transition-transform h-screen max-h-[100dvh] min-h-screen select-none md:relative w-[260px] text-foreground text-sm fixed top-0 left-0 bg-secondary border-r ${!isExpanded && 'hidden'}`}
      >
        <div className="flex px-2 py-2 w-full">
          <div className="flex justify-between items-center w-full gap-2 px-2">
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
        <div className="px-2 font-medium lg:ps-4 overflow-y-scroll scrollbar w-[100%] h-[90vh] max-h-[90vh]">
          {Object.entries(organizeChatsByDate)
            .reverse()
            .map(([group, groupChats]: any) => (
              <div key={group}>
                <div className="sticky top-0 py-2 w-[100%] text-xs font-semibold text-muted-foreground capitalize">
                  {group}
                </div>
                {groupChats.reverse().map((chat: Chat) => (
                  <div className="w-full pr-2 relative group">
                    <button
                      key={chat.uuid}
                      value={chat.uuid}
                      className={`truncate w-full flex justify-between rounded-lg px-3 py-2 hover:bg-accent ${
                        props.uuid === chat.uuid && 'text-foreground bg-accent'
                      }`}
                      onClick={() => {
                        getChatHistory(chat.uuid);
                      }}
                    >
                      <div className="flex self-center flex-1 w-full">
                        <div className="text-left self-center overflow-hidden w-full h-[20px]">
                          {chat.messages[0]?.content ?? 'Some message...'}
                        </div>
                      </div>
                      <div
                        className={`${props.uuid === chat.uuid ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 z-0 from-accent absolute right-[10px] top-[6px] py-1 pr-2 pl-5 bg-gradient-to-l from-80% to-transparent`}
                      >
                        <div className="flex self-center space-x-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <DotsHorizontalIcon className="hover:stroke-primary self-center transition" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[150px]">
                              <DropdownMenuGroup>
                                <DropdownMenuItem className="gap-2 items-center">
                                  <Pin className="size-3" /> Pin
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 items-center">
                                  <Pen className="size-3" /> Rename
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="flex gap-2 items-center group">
                                <Trash className="size-3.5 group-hover:stroke-red-500" />
                                <span className="group-hover:text-red-500">Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
