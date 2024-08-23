import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import BotMessage from "@/components/bot-message";
import { Ellipsis, Origami, SlidersHorizontal, User } from "lucide-react";
import { Ollama } from "@/services/ollama.ts";
import React, { useEffect, useRef, useState } from "react";
import { ChatResponse, Message } from "@/types/ollama";
import { Storage } from "@/services/storage";
import { OLLAMA_SETTINGS } from "@/settings/ollama";
import { DATABASE_SETTINGS } from "@/settings/database";
import { v4 as uuidv4 } from "uuid";
import ChatDrawer from "@/components/chat-drawer";
import { useSearchParams } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { Textbox } from "@/components/textbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import LoadModels from "@/components/load-models.tsx";

const ollama: Ollama = new Ollama(OLLAMA_SETTINGS);
const storage: Storage = new Storage(DATABASE_SETTINGS);

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

export function ChatPage() {
  const [model, setModel] = useState("llama3:latest");
  const [uuid, setUuid] = useState("");
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  let [_, setSearch] = useSearchParams();

  const ref = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function write(response: ChatResponse[]): Promise<Message[]> {
    let curr: string = "";
    for await (const part of response) {
      curr += part.message.content;
    }
    setIsTyping(false);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: curr,
        chat: uuid,
        model: model,
      },
    ]);

    await storage.createMessage({
      model: model,
      content: curr,
      role: "assistant",
      chat: uuid,
    });

    return messages;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const mes: Message = {
      model: model,
      content: message,
      role: "user",
      chat: uuid,
    };

    await storage.createMessage(mes);

    const newHistory: Message[] = [...messages, mes];

    setMessages(newHistory);

    setMessage("");
    setIsTyping(true);
    const response: ChatResponse[] = await ollama.chat(
      { model: model, messages: newHistory },
      { stream: true }
    );
    await write(response);
  }

  function updateModel(param: any) {
    setModel(param);
  }

  async function createChat() {
    const chat_uuid = uuidv4();
    setUuid(chat_uuid);
    setSearch("");
    setMessages((_) => []);

    await storage.createChat({ uuid: chat_uuid, model: model });
  }

  async function getChatHistory(id: string) {
    const response = await storage.getChat(id);
    setUuid(response?.uuid);
    setSearch(`c=${response?.uuid}`);
    const messages: Message[] = response?.messages;
    setMessages([]);
    let msgs: Message[] = [];
    messages.forEach((message: Message) => {
      msgs.push(message);
    });
    setMessages(msgs);
  }

  return (
    <>
      <ChatDrawer
        updateModel={updateModel}
        createChat={createChat}
        getChatHistory={getChatHistory}
        uuid={uuid}
        model={model}
      />
      <div className="h-screen max-h-[100dvh] md:max-w-[calc(100%-260px)] w-full max-w-full flex flex-col">
        <div className="sticky py-2.5 top-0 flex flex-row z-10 grow-0 px-4 gap-3 justify-between items-center col-span-4 w-full rounded-b-none bg-background h-14">
          <div className="flex items-center gap-3 font-semibold text-lg ps-4">
            <LoadModels updateModel={updateModel} />
          </div>
          <div className="flex items-center gap-1 pe-6">
            <Button size="icon" variant="ghost">
              <Ellipsis className="size-4" strokeWidth="1.5" />
            </Button>
            <Button size="icon" variant="ghost">
              <SlidersHorizontal className="size-4" strokeWidth="1.5" />
            </Button>
            <div className="h-8 hidden flex w-8 rounded-full items-center justify-center bg-red-700">
              <User
                className="size-5 stroke-primary-foreground"
                strokeWidth="1"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-auto z-10">
          <div className="pb-2.5 flex flex-col justify-between w-full flex-auto overflow-auto h-0 max-w-full z-10 scrollbar-hidden">
            <div className="max-w-5xl mx-auto">
              {messages.length !== 0 &&
                messages.map((message) => (
                  <BotMessage
                    isBot={message?.role !== "user"}
                    isTyping={false}
                    message={message?.content}
                    time={message?.time}
                    username={
                      message?.role === "user" ? message?.role : message?.model
                    }
                  />
                ))}
            </div>
          </div>
          {isTyping && (
            <div className="absolute bottom-4 border-primary border-2 bg-primary/10 p-2 rounded-lg left-6">
              <div className="flex gap-2 items-center">
                <Origami className="size-5" strokeWidth="1" /> {model} is typing{" "}
                <PulseLoader
                  size="3"
                  speedMultiplier={0.75}
                  color="#ffffff"
                  className="stroke-primary-foreground"
                />
              </div>
            </div>
          )}
          <div ref={ref} />
          <div className="mb-5 z-[99]">
            <div className="-mb-3.5 mx-auto inset-x-0 bg-transparent flex justify-center"></div>
            <Textbox
              value={message}
              setValue={setMessage}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </>
  );
}
