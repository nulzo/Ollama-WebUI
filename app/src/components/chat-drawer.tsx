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

import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ollama } from "@/services/ollama.ts";
import { useState } from "react";
import { ChatResponse, Message } from "@/types/ollama";
import { Storage } from "@/services/storage";
import { useModels } from "@/hooks/use-models";
import { useChats } from "@/hooks/use-chats.ts";
import { OLLAMA_SETTINGS } from "@/settings/ollama";
import { DATABASE_SETTINGS } from "@/settings/database";
import { v4 as uuidv4 } from "uuid";

const ollama: Ollama = new Ollama(OLLAMA_SETTINGS);
const storage: Storage = new Storage(DATABASE_SETTINGS);

export default function ChatHistory() {
    const models = useModels(ollama);
    const chats = useChats(storage);

    const [model, setModel] = useState("llama3:latest");
    const [uuid, setUuid] = useState("");
    const [nmessages, setNmessages] = useState<any[]>([]);
    const [_, setChatID] = useState<number | undefined>(undefined);

  
    async function createChat() {
      const chat_uuid = uuidv4();
      setUuid(chat_uuid);
      await storage.createChat({ uuid: chat_uuid, model: model });
    }
  
    async function getChatHistory(id: number) {
      const response = await storage.getChat(id);
      setChatID(id);
      response.messages.forEach((element: Message) => {
        setNmessages([
          ...nmessages,
          {
            userMessage: { role: "user", content: element.content },
            botMessage: { role: "assistant", content: "" },
          },
        ]);
      });
    }

    return (
      <div className="flex flex-col w-full h-[75vh] rounded-lg border p-4">
      <div className="grid grid-cols-5">
        <div className="flex gap-2 items-center col-span-4">
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
              onValueChange={(value) => setModel(value)}
              defaultValue={model}
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
        <div className="col-span-1 flex justify-end justify-items-end">
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
      <div className="space-y-1 mt-4 overflow-y-scroll">
        {!chats?.isLoading &&
          chats?.data.map((chat: any) => (
            <Button
              onClick={(event) => {
                const target = event.target as HTMLButtonElement;
                getChatHistory(Number(target.value));
              }}
              value={chat.uuid}
              size="sm"
              variant="ghost"
              className="w-full justify-start text-xs truncate"
              key={`chat-${chat.uuid}`}
            >
              {chat.uuid}
            </Button>
          ))}
      </div>
    </div>
    )
}
