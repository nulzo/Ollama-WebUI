import {
  isToday,
  isThisWeek,
  isThisMonth,
  isBefore,
  subMonths,
} from "date-fns";
import { PanelRightOpen, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Chat } from "@/services/ollama.ts";
import { Storage } from "@/services/storage.ts";
import { useChats } from "@/hooks/use-chats.ts";
import { DATABASE_SETTINGS } from "@/settings/database.ts";
import { useMemo } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

const storage: Storage = new Storage(DATABASE_SETTINGS);

export default function ChatDrawer(props: any) {
  const chats = useChats(storage);

  async function createChat() {
    props.createChat();
    chats?.refetch();
  }

  async function getChatHistory(id: string) {
    props.getChatHistory(id);
    props.updateURL(`c=${id}`);
  }

  const getDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return "Today";
    if (isThisWeek(date)) return "Previous Week";
    if (isThisMonth(date)) return "This Month";
    if (isBefore(date, subMonths(new Date(), 1))) return "Last Month";
    return "Older";
  };

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

  return (
    <>
      <div className="h-screen max-h-[100dvh] min-h-screen select-none md:relative w-[260px] text-foreground text-sm transition fixed top-0 left-0 bg-secondary border-r">
        <div className="flex px-2 py-2 w-full">
          <div className="flex justify-between items-center w-full gap-2 px-2">
            <Button
              size="icon"
              variant="ghost"
              type="submit"
              className="font-bold"
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
        <div className="px-2 text-sm font-medium lg:ps-4 overflow-y-scroll scrollbar w-[100%] h-[90vh] max-h-[90vh]">
          {Object.entries(organizeChatsByDate)
            .reverse()
            .map(([group, groupChats]: any) => (
              <div key={group}>
                <div className="sticky top-0 py-2 w-[100%] text-xs font-bold capitalize">
                  {group}
                </div>
                {groupChats.reverse().map((chat: Chat) => (
                  <button
                    key={chat.uuid}
                    value={chat.uuid}
                    className={`group truncate text-xs h-8 ps-2 z-20 justify-start w-[100%] rounded-lg text-muted-foreground transition-all whitespace-nowrap text-nowrap duration:100 hover:bg-accent items-center ${
                      props.uuid === chat.uuid && "text-foreground bg-accent/50"
                    }`}
                    onClick={() => {
                      getChatHistory(chat.uuid);
                    }}
                  >
                    <div className="flex relative items-start gap-2 w-[100%]">
                      <div className="flex flex-col">
                        <div className="text-xs text-left truncate">
                          {chat.messages[0]?.content ?? "Some message..."}
                        </div>
                        <div className="absolute flex items-center right-0 w-8 invisible bg-accent group-hover:visible group-hover:opacity-100 opacity-0 transition-all ease-in-out duration-200 ps-2">
                          <DotsHorizontalIcon className="hover:stroke-primary" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
