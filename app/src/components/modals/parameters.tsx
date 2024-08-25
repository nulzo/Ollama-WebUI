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
  } from "@/components/ui/select.tsx";
  
  import { Skeleton } from "@/components/ui/skeleton.tsx";
  import { Plus } from "lucide-react";
  import { Button } from "@/components/ui/button.tsx";
  import { Ollama } from "@/services/ollama.ts";
  import { ChatResponse } from "@/types/providers/ollama";
  import { Storage } from "@/services/storage.ts";
  import { useModels } from "@/hooks/use-models.ts";
  import { useChats } from "@/hooks/use-chats.ts";
  import { OLLAMA_SETTINGS } from "@/settings/ollama.ts";
  import { DATABASE_SETTINGS } from "@/settings/database.ts";
  import { ScrollArea } from "../ui/scroll-area.tsx";
  
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
  
    return (
      <>
        <div className="flex p-2 w-full">
          <div className="flex gap-2 items-center basis-1/2">
            {models?.isLoading && (
              <Skeleton className="items-start w-3/4">
                <div className="items-start h-9 [&_[data-description]]:hidden w-3/4" />
              </Skeleton>
            )}
            {models?.isError && (
              <div className="items-start w-3/4">
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
                  className="items-start [&_[data-description]]:hidden w-3/4"
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
                    <TooltipTrigger className="size-2 rounded-full bg-green-400 border border-green-200" />
                    <TooltipContent className="bg-background border-border border">
                      Online
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
          <div className="flex justify-end justify-items-end">
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
        <ScrollArea className="space-y-1 overflow-auto h-48 pb-2 flex flex-row">
          {!chats?.isLoading &&
            chats?.data.map((chat: any) => (
              <Button
                onClick={(event) => {
                  const target = event.target as HTMLButtonElement;
                  getChatHistory(target.value);
                }}
                value={chat.uuid}
                size="sm"
                variant="ghost"
                className="w-full justify-start flex text-xs truncate"
                key={`chat-${chat.uuid}`}
              >
                {chat.messages[0]?.content ?? "some message ..."}
              </Button>
            ))}
        </ScrollArea>
      </>
    );
  }
  