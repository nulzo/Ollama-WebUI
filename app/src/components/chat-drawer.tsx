import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  isToday,
  isThisWeek,
  isThisMonth,
  isBefore,
  subMonths,
} from "date-fns";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { History, Origami, Plus, SquarePen, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chat, Ollama } from "@/services/ollama.ts";
import { ChatResponse } from "@/types/ollama";
import { Storage } from "@/services/storage";
import { useModels } from "@/hooks/use-models";
import { useChats } from "@/hooks/use-chats.ts";
import { OLLAMA_SETTINGS } from "@/settings/ollama";
import { DATABASE_SETTINGS } from "@/settings/database";
import { useMemo } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

const ollama: Ollama = new Ollama(OLLAMA_SETTINGS);
const storage: Storage = new Storage(DATABASE_SETTINGS);

export default function ChatDrawer(props: any) {
  const models = useModels(ollama);
  const chats = useChats(storage);

  function updateModel(elem: string) {
    props.updateModel(elem);
  }

  async function createChat() {
    props.createChat();
    chats?.refetch();
  }

  async function getChatHistory(id: string) {
    props.getChatHistory(id);
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
      <div className="flex p-2 w-full">
        <div className="flex gap-2 items-center basis-3/4">
          {models?.isLoading && (
            <Skeleton className="items-start w-full">
              <div className="items-start h-9 [&_[data-description]]:hidden w-full" />
            </Skeleton>
          )}
          {models?.isError && (
            <div className="items-start w-full">
              <div className="h-9 border border-red-400 text-red-400 text-sm justify-center flex items-center rounded-lg w-full [&_[data-description]]:hidden">
                {models.error.name}!
              </div>
            </div>
          )}
          {models?.isSuccess && (
            <Select
              onValueChange={(value) => updateModel(value)}
              defaultValue={props.model}
            >
              <SelectTrigger
                id="model"
                className="items-start [&_[data-description]]:hidden w-full"
              >
                <SelectValue placeholder="select model" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {models?.data?.models?.map((m: ChatResponse) => (
                  <SelectItem key={m.model} value={m.model}>
                    {m.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {models?.isLoading && (
            <span className="size-2 rounded-full bg-primary-400 border border-primary-200 animate-pulse" />
          )}
          {models?.isError && (
            <span className="size-2 rounded-full bg-red-400 border border-red-200" />
          )}
          {models?.isSuccess && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="size-2 rounded-full bg-green-300 border border-green-200" />
                  <TooltipContent className="bg-background border-green-200 text-green-200 border">
                    Online
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 w-full justify-items-end">
          <Button
            size="icon"
            variant="ghost"
            type="submit"
            onClick={() => {
              createChat();
            }}
          >
            <SquarePen className="size-4" />
          </Button>
        </div>
      </div>
      <div className="px-2 text-sm font-medium lg:px-4 overflow-y-scroll w-[100%] h-[85vh] max-h-[85vh]">
        {Object.entries(organizeChatsByDate)
          .reverse()
          .map(([group, groupChats]: any) => (
            <div key={group}>
              <div className="bg-background sticky top-0 py-2 w-[100%] text-xs font-bold capitalize">
                {group}
              </div>
              {groupChats.reverse().map((chat: Chat) => (
                <button
                  key={chat.uuid}
                  value={chat.uuid}
                  className="group truncate text-xs my-1 h-12 ps-2 z-20 justify-start w-[100%] rounded-lg text-muted-foreground transition-all whitespace-nowrap text-nowrap duration:200 hover:bg-accent items-center"
                  onClick={() => {
                    getChatHistory(chat.uuid);
                  }}
                >
                  <div className="flex relative items-start gap-2 w-[100%]">
                    <div className="relative p-2 bg-foreground/50 rounded-lg">
                      <Origami
                        strokeWidth="1"
                        className="size-4 text-primary-foreground"
                      />
                      <div className="absolute -right-0.5 -bottom-0.5 rounded-full h-2 w-2 bg-green-400" />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-bold text-sm text-left transition-all group-hover:text-primary truncate">
                        {chat.model}
                      </div>
                      <div className="font-light text-xs text-left truncate">
                        {chat.messages[0]?.content ?? "Some message..."}
                      </div>
                      <div className="absolute flex items-center bg-accent right-0 h-9 w-8 invisible group-hover:visible group-hover:opacity-100 opacity-0 transition-all ease-in-out duration-200 ps-2">
                        <DotsHorizontalIcon className="hover:stroke-primary"/>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}
      </div>
    </>
  );
}
