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
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import BotMessage from "@/components/bot-message";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Paperclip, Send, Image, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Ollama } from "@/services/ollama.ts";
import React, { useState } from "react";
import { ChatResponse, Message } from "@/types/ollama";
import { Storage } from "@/services/storage";
import { useModels } from "@/hooks/use-models";
import { useChats } from "@/hooks/use-chats.ts";
import { OLLAMA_SETTINGS } from "@/settings/ollama";
import { DATABASE_SETTINGS } from "@/settings/database";
import { v4 as uuidv4 } from "uuid";

interface MessageState {
  userMessage: Message;
  botMessage: Message;
}

const ollama: Ollama = new Ollama(OLLAMA_SETTINGS);
const storage: Storage = new Storage(DATABASE_SETTINGS);

export function ChatPage() {
  const allModels = useModels(ollama);
  const allChats = useChats(storage);
  const [model, setModel] = useState("llama3:latest");
  const [uuid, setUuid] = useState("");
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [botMessages, setBotMessages] = useState<Message[]>([]);
  const [nmessages, setNmessages] = useState<MessageState[]>([]);
  const [_, setChatID] = useState<number | undefined>(undefined);

  async function write(
    response: ChatResponse[]
  ): Promise<(Message | { role: string; content: string })[]> {
    let curr: string = "";
    for await (const part of response) {
      curr += part.message.content;
      setNmessages([
        ...nmessages,
        {
          userMessage: { role: "user", content: message },
          botMessage: { role: "assistant", content: curr },
        },
      ]);
    }

    const newHistory = [...botMessages, { role: "assistant", content: curr }];
    await storage.createMessage({
      model: model,
      message: curr,
      role: "assistance",
      chat_uuid: uuid,
    });
    setBotMessages(newHistory);
    return newHistory;
  }

  function onKeyPress(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter") {
      handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await storage.createMessage({
      model: model,
      message,
      role: "user",
      chat_uuid: uuid,
    });

    const newHistory: Message[] = [
      ...userMessages,
      { role: "user", content: message },
    ];
    setNmessages([
      ...nmessages,
      {
        userMessage: { role: "user", content: message },
        botMessage: { role: "assistant", content: "" },
      },
    ]);
    const history: Message[] = ollama.mergeMessageArray(
      newHistory,
      botMessages
    );
    const data = { model: model, stream: true, messages: history };
    setMessage("");
    setIsTyping(true);
    setUserMessages(newHistory);
    const response: ChatResponse[] = await ollama.chat(data, { stream: true });
    setIsTyping(false);
    await write(response);
  }

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
    <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-5">
      <div className="relative hidden md:flex items-start">
        <div className="w-full space-y-4">
          <div className="flex flex-col w-full h-[75vh] rounded-lg border p-4">
            <div className="grid grid-cols-5">
              <div className="flex gap-2 items-center col-span-4">
                {allModels?.isLoading && (
                  <Skeleton className="items-start w-3/4">
                    <div className="items-start h-9 [&_[data-description]]:hidden w-3/4" />
                  </Skeleton>
                )}
                {allModels?.isError && (
                  <div className="items-start w-3/4">
                    <div className="h-9 border border-red-400 text-red-400 text-sm justify-center flex items-center rounded-lg w-full [&_[data-description]]:hidden">
                     {allModels.error.name}!
                    </div>
                  </div>
                )}
                {allModels?.isSuccess && (
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
                      {allModels?.data?.models?.map((m: ChatResponse) => (
                        <SelectItem key={m.model} value={m.model}>
                          {m.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {allModels?.isLoading && (
                  <span className="size-2 rounded-full bg-primary-400 border border-primary-200 animate-pulse" />
                )}
                {allModels?.isError && (
                  <span className="size-2 rounded-full bg-red-400 border border-red-200" />
                )}
                {allModels?.isSuccess && (
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
              {!allChats?.isLoading &&
                allChats?.data.map((chat: any) => (
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
          <div className="h-[100px] p-4 items-center flex flex-col text-center justify-center rounded-lg border-primary/50 border-2 bg-primary/5">
            <div className="flex font-semibold text-sm align-middle gap-1 mb-2 justify-center items-center">
              Don't forget to give me a star! <Star className="size-3" />
            </div>
            <div className="flex flex-col text-xs align-middle gap-1 justify-center items-center">
              <div className="flex">
                I am just kidding. Don't do that... Touch grass instead
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-4">
        <ScrollArea className="relative  flex h-full max-h-[75vh] min-h-[50vh] flex-col rounded-xl bg-accent/25 border p-4">
          <div className="mx-4">
            {nmessages.length !== 0 &&
              nmessages.map((message) => (
                <>
                  <BotMessage
                    isBot={false}
                    isTyping={false}
                    message={message?.userMessage?.content}
                    username={message.userMessage?.role}
                  />
                  <BotMessage
                    isBot={true}
                    isTyping={isTyping}
                    message={message?.botMessage?.content}
                    username={message?.botMessage?.role}
                  />
                </>
              ))}
          </div>
        </ScrollArea>
        <div className="flex flex-col mt-4">
          <div className="flex-1" />
          <div className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring">
            <Label htmlFor="chatMessage" className="sr-only">
              Chat Message
            </Label>
            <Textarea
              id="chatMessage"
              key="chatMessageArea"
              className="m-0 w-full focus:border-transparent focus-visible:ring-0 resize-none border-0 p-3 shadow-none h-[52px] min-h-[52px] items-center bg-background align-middle"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={onKeyPress}
            />
            <div className="flex items-center p-3 pt-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Paperclip className="size-3" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Attach File</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Image className="size-3" />
                      <span className="sr-only">Upload Image</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Upload Image</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Mic className="size-3" />
                      <span className="sr-only">Use Microphone</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Use Microphone</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                type="submit"
                disabled={message.length === 0 || model.length === 0}
                onClick={handleSubmit}
                size="sm"
                className="ml-auto gap-1.5 text-foreground"
              >
                <Send className="size-3" />
                <span className="sr-only">Send Message</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
