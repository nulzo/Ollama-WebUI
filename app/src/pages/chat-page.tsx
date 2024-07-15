import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import BotMessage from "@/components/bot-message";
import { Origami } from "lucide-react";
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
import StarBox from "@/components/star-comment";

const ollama: Ollama = new Ollama(OLLAMA_SETTINGS);
const storage: Storage = new Storage(DATABASE_SETTINGS);

export function ChatPage() {
  const [model, setModel] = useState("llama3:latest");
  const [uuid, setUuid] = useState("");
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
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
      { model: model, messages: newHistory }, { stream: true }
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
    <main className="grid m-5 flex-1 gap-5 overflow-auto md:grid-cols-2 lg:grid-cols-5">
      <div className="relative hidden md:flex items-start">
        <div className="w-full space-y-4">
          <ChatDrawer
            updateModel={updateModel}
            createChat={createChat}
            getChatHistory={getChatHistory}
            model={model}
          />
          <StarBox />
        </div>
      </div>
      <div className="lg:col-span-4">
        <ScrollArea className="relative flex overflow-auto flex-col-reverse h-full max-h-[75vh] min-h-[50vh] rounded-xl bg-accent/25 border p-4">
          <div className="mx-4">
            {messages.length !== 0 && messages.map((message) => (
                <BotMessage
                  isBot={message?.role !== "user"}
                  isTyping={false}
                  message={message?.content}
                  username={message?.role === "user" ? message?.role : message?.model}
                />
              ))}
          </div>
          {isTyping && (
            <div className="absolute bottom-4 border-primary border-2 bg-primary/10 p-2 rounded-lg left-6">
              <div className="flex gap-2 items-center">
                <Origami className="size-5" /> {model} is typing{" "}
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
        <div className="flex flex-col mt-4">
          <Textbox
            value={message}
            setValue={setMessage}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </main>
  );
}
