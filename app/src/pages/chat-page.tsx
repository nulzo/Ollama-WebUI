import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import BotMessage from "@/components/bot-message";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Paperclip, Send, Image, Star, Origami } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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


const ollama: Ollama = new Ollama(OLLAMA_SETTINGS);
const storage: Storage = new Storage(DATABASE_SETTINGS);


export function ChatPage() {
  const [model, setModel] = useState("llama3:latest");
  const [uuid, setUuid] = useState('');
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [rows, setRows] = useState(1);
  const [history, setHistory] = useState([]);
  let [_, setSearch] = useSearchParams();
  const ref = useRef(null);

  const scrollToBottom = () => {
    ref.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);


  async function write(response: ChatResponse[]): Promise<(Message)[]> {
    let curr: string = "";
    for await (const part of response) {
      curr += part.message.content;
    }
    setIsTyping(false);
    setMessages(prevMessages => [
      ...prevMessages,
      {
        role: "assistant",
        content: curr,
        chat: uuid,
        model: model
      }
    ]);

    await storage.createMessage({
      model: model,
      content: curr,
      role: "assistant",
      chat: uuid,
    });

    return messages;
  }

  function handleChange(event) {
    setMessage(event.target.value);
    setRows(event.target.value.split('\n').length + 1);
  }

  function onKeyPress(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.keyCode === 38 && history.length > 0) {
      const  prev = history[history.length - 1];
      setMessage(prev);
      event.currentTarget.selectionStart = prev.length;
    }
    if (event.keyCode === 13 && event.shiftKey) {
      setMessage(event.target.value + '\n');
      event.preventDefault();
    }
    if (event.key === "Enter") {
      handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const mes: Message = {
      model: model,
      content: message,
      role: "user",
      chat: uuid,
    }

    setHistory((prev: any) => [...prev, message]);

    await storage.createMessage(mes);

    const newHistory: Message[] = [...messages, mes];
    
    setMessages(newHistory);

    const data = { model: model, messages: newHistory };
    setMessage("");
    setIsTyping(true);
    const response: ChatResponse[] = await ollama.chat(data, { stream: true });
    await write(response);
  }

  function updateModel(param: any) {
    setModel(param);
  }

  async function createChat() {
    const chat_uuid = uuidv4();
    setUuid(chat_uuid);
    setSearch('');
    setMessages(_ => []);

    await storage.createChat({ uuid: chat_uuid, model: model });
  }

  async function getChatHistory(id: string) {
    const response = await storage.getChat(id);
    setUuid(response?.uuid);
    setSearch(`c=${response?.uuid}`);
    const messages: Message[] = response?.messages;
    setMessages([]);
    let msgs: Message[] = []
    messages.forEach((message: Message) => {
      msgs.push(message);
    });
    setMessages(msgs);
  }

  return (
    <main className="grid m-5 flex-1 gap-5 overflow-auto md:grid-cols-2 lg:grid-cols-5">
      <div className="relative hidden md:flex items-start">
        <div className="w-full space-y-4">
          <ChatDrawer updateModel={updateModel} createChat={createChat} getChatHistory={getChatHistory} model={model} />
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
        <ScrollArea className="relative flex overflow-auto flex-col-reverse h-full max-h-[75vh] min-h-[50vh] flex-col rounded-xl bg-accent/25 border p-4">
          <div className="mx-4">
            {messages.length !== 0 &&
              messages.map((message) => (
                <>
                  <BotMessage
                    isBot={message?.role !== 'user'}
                    isTyping={false}
                    message={message?.content}
                    username={message?.role === 'user' ? message?.role : message?.model}
                  />
                </>
              ))}
          </div>
            {isTyping && (
              <div className="absolute bottom-4 border-primary border-2 bg-primary/10 p-2 rounded-lg left-6">
                <div className="flex gap-2 items-center">
                  <Origami className="size-5" /> {model} is typing <PulseLoader size="3" speedMultiplier={0.75} color="#ffffff" className="stroke-primary-foreground" />
                </div>
              </div>
            )}
            <div ref={ref} />
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
              className="m-0 w-full focus:border-transparent focus-visible:ring-0 resize-none border-0 p-3 shadow-none min-h-[52px] items-center bg-background align-middle"
              value={message}
              onChange={(event) => handleChange(event)}
              onKeyDown={onKeyPress}
              rows={rows}
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
