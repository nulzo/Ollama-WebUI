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
    <main className="grid flex-col overscroll-none overflow-auto md:grid-cols-2 lg:grid-cols-[min-content_1fr] grid-rows-10 grid-flow-col h-screen">
      <div className="lg:col-span-1 hidden md:flex flex-col items-start border rounded-lg row-span-10 w-72 max-w-72">
        <div className="flex-col w-[100%]">
          <ChatDrawer
            updateModel={updateModel}
            createChat={createChat}
            getChatHistory={getChatHistory}
            uuid={uuid}
            model={model}
          />
        </div>
      </div>
      <div className="grid grid-rows-12 row-span-10 w-[100%]">
        <div className="px-4 gap-3 flex justify-between items-center col-span-4 w-full rounded-lg rounded-b-none bg-accent/35 row-span-1 border-r border-l border-t border-b">
          <div className="flex items-center gap-3 font-semibold text-lg ps-4">
            <div className="relative p-2 bg-accent rounded-lg">
              <Origami strokeWidth='1' className="size-5 text-primary-foreground" />
              <div className='absolute -right-0.5 -bottom-0.5 rounded-full h-2 w-2 bg-green-400'/>
            </div>
            {model}
          </div>
          <div className="flex items-center gap-1 pe-6">
            <Button
              size="icon"
              variant="ghost"
            >
              <Ellipsis className="size-4" strokeWidth="1.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
            >
              <SlidersHorizontal className="size-4" strokeWidth="1.5" />
            </Button>
            <div className="h-8 hidden flex w-8 rounded-full items-center justify-center bg-red-700">
              <User className="size-5 stroke-primary-foreground" strokeWidth="1" />
            </div>
          </div>
        </div>
        <div className="col-span-4 grid grid-rows-6 row-span-11 max-h-screen rounded-lg bg-accent/25 border-r border-l border-b border-border px-4 rounded-t-none">
          <ScrollArea className="relative row-span-5 overflow-y-scroll flex-col-reverse">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between hidden"
                >
                  {value
                    ? frameworks.find((framework) => framework.value === value)
                        ?.label
                    : "Select framework..."}
                  <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search framework..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                      {frameworks.map((framework) => (
                        <CommandItem
                          key={framework.value}
                          value={framework.value}
                          onSelect={(currentValue) => {
                            setValue(
                              currentValue === value ? "" : currentValue
                            );
                            setOpen(false);
                          }}
                        >
                          {framework.label}
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              value === framework.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="mx-4 row-span-4">
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

            {isTyping && (
              <div className="absolute bottom-4 border-primary border-2 bg-primary/10 p-2 rounded-lg left-6">
                <div className="flex gap-2 items-center">
                  <Origami className="size-5" strokeWidth="1" /> {model} is
                  typing{" "}
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
          </ScrollArea>
          <div className="flex p-4">
            <Textbox
              value={message}
              setValue={setMessage}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
