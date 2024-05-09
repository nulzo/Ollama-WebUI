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
import ResponseBox from "@/components/responseBox.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Paperclip, Send, Image, Plus, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Ollama } from "@/services/ollama.ts";
import React, { useState } from "react";
import { ChatResponse, Message } from "@/types/ollama";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {Badge} from "@/components/ui/badge.tsx";
import getModels from "@/api/getModels";
import { Storage } from "@/services/storage";
import { QueryChats } from "@/services/query";

interface MessageState {
  userMessage: Message;
  botMessage: Message;
}

const ollama: Ollama = new Ollama({
  endpoint: "/api",
  host: "http://127.0.0.1",
  port: 11434,
});

const storage: Storage = new Storage({
  endpoint: '/api/v1',
  host: 'http://127.0.0.1',
  port: 8000
})

export function ChatPage() {
  const allModels = useQuery({ queryKey: ["models"], queryFn: getModels });
  const allChats = useQuery({ queryKey: ["chats"], queryFn: QueryChats});
  const [model, setModel] = useState("");
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [botMessages, setBotMessages] = useState<Message[]>([]);
  const [nmessages, setNmessages] = useState<MessageState[]>([]);
  const [chatID, setChatID] = useState<number|undefined>(undefined);

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
    await storage.createMessage(
      {model: model, message: curr, role: "assistance", chat: 1}
    );
    setBotMessages(newHistory);
    return newHistory;
  }

  function onKeyPress(event) {
    if(event.key === 'Enter') { onSubmit(event); }
  }

  async function onSubmit(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    event.preventDefault();
    await storage.createMessage(
      {model: '', message: message, role: "user", chat: 1}
    );
    
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

  async function createChat(name: string = '') {
    await storage.createChat({name: name, model: model});
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
    const values = response.messages;
    console.log(response);
  }

  return (
    <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-5">
      <div className="relative hidden md:flex items-start">
        <div className="w-full space-y-4">
          <div className="flex flex-col w-full h-[75vh] rounded-lg border p-4">
            <Label className="px-1 text-sm font-semibold mb-4"><Badge variant="outline">Chat History</Badge></Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Plus className="size-4 mr-1" />
                  <span>New Chat</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Start a New Chat</DialogTitle>
                  <DialogDescription>
                    Create a new chat history with one of your local LLMs.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="model" className="text-right">
                        Model<span className="text-primary ml-1">*</span>
                      </Label>
                      {allModels.isLoading ? (
                        <Skeleton className="h-9 w-full col-span-3 rounded-lg" />
                      ) : (
                        <Select
                          onValueChange={(value) => setModel(value)}
                          defaultValue={model}
                        >
                          <SelectTrigger
                            id="model"
                            className="items-start col-span-3 [&_[data-description]]:hidden"
                          >
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            {allModels.data?.models?.map((m: ChatResponse) => (
                              <SelectItem key={m.model} value={m.model}>
                                {m.model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                 
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Chat Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="optional"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                  <Button type="submit" onClick={() => {createChat()}}>Start Chat</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="space-y-1">
            {!allChats.isLoading && allChats.data.map(chat => (
                <Button onClick={(event) => {getChatHistory(event.target.value)}} value={chat.id} size="sm" variant="ghost" className="w-full text-xs" key={`chat-${chat.id}`}>
                  {chat.name}
                </Button>
            ))}
            </div>
          </div>
          <div className="h-[100px] p-4 items-center flex flex-col text-center justify-center rounded-lg border-primary/50 border-2 bg-primary/5">
            <div className="flex font-semibold text-sm align-middle gap-1 mb-2 justify-center items-center">
              Don't forget to give me a star! <Star className="size-3" />
            </div>
            <div className="flex flex-col text-xs align-middle gap-1 justify-center items-center">
              <div className="flex">I am just kidding. Don't do that... Touch grass instead</div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-4">
        <ScrollArea className="relative whitespace-pre-line flex h-full max-h-[75vh] min-h-[50vh] flex-col rounded-xl bg-accent/25 border p-4">
          <div className="mx-4">
            {nmessages.length !== 0 &&
              nmessages.map((message) => (
                <>
                  <ResponseBox
                    isBot={false}
                    isTyping={false}
                    message={message?.userMessage?.content}
                    username={message.userMessage?.role}
                  />
                  <ResponseBox
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
            <Label htmlFor="chatMessage" className="sr-only">Chat Message</Label>
            <Textarea
              id="chatMessage"
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
                onClick={onSubmit}
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
