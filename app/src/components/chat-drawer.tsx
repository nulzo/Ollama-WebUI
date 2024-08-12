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
import { History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ollama } from "@/services/ollama.ts";
import { ChatResponse } from "@/types/ollama";
import { Storage } from "@/services/storage";
import { useModels } from "@/hooks/use-models";
import { useChats } from "@/hooks/use-chats.ts";
import { OLLAMA_SETTINGS } from "@/settings/ollama";
import { DATABASE_SETTINGS } from "@/settings/database";

const ollama: Ollama = new Ollama(OLLAMA_SETTINGS);
const storage: Storage = new Storage(DATABASE_SETTINGS);

export default function ChatDrawer(props) {
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

  function getDateLabel(timestamp: string) {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return "Today";
    } else if (isThisWeek(date)) {
      return "Previous Week";
    } else if (isThisMonth(date)) {
      return "This Month";
    } else if (isBefore(date, subMonths(new Date(), 1))) {
      return "Last Month";
    } else {
      return "Older";
    }
  }

  function organizeChatsByDate(chats) {
    const groups = {};

    chats?.data.forEach((chat) => {
      const label = getDateLabel(chat.created_at);
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(chat);
    });
    console.log(groups);
    return groups;
  }

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
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      <div className="px-2 text-sm font-medium lg:px-4 overflow-y-scroll w-full h-[80vh] max-h-[80vh]">
        {!chats?.isLoading &&
          Object.keys(organizeChatsByDate(chats))
            .reverse()
            .map((group) => (
              <>
                <div className="text-xs font-bold capitalize py-2 w-full bg-background sticky top-0">{group}</div>
                {organizeChatsByDate(chats)[group].reverse().map((chat) => (
                  <Button
                    onClick={(event) => {
                      const target = event.target as HTMLButtonElement;
                      getChatHistory(target.value);
                    }}
                    value={chat.uuid}
                    size="sm"
                    variant="ghost"
                    className="flex items-center justify-start truncate w-full rounded-lg py-0 text-muted-foreground transition-all hover:text-primary"
                    key={`chat-${chat.uuid}`}
                  >
                    {chat.messages[0]?.content ?? "some message ..."}
                  </Button>
                ))}
              </>
            ))}
      </div>
    </>
  );
}
