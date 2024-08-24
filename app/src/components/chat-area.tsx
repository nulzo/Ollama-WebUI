import { forwardRef } from "react";
import BotMessage from "./bot-message";
import { Message } from "@/types/ollama";
import { PulseLoader } from "react-spinners";
import { Origami } from "lucide-react";

export const ChatArea = forwardRef<HTMLDivElement, { messages: Message[], model: string, isTyping: boolean }>(({ messages, model, isTyping }, ref) => (
    <div className="pb-10 flex flex-col justify-between w-full flex-auto overflow-auto h-0 max-w-full z-10 scrollbar-hidden">
      <div className="max-w-5xl mx-auto">
        {messages.length !== 0 &&
          messages.map((message) => (
            <BotMessage
              isBot={message?.role !== "user"}
              isTyping={false}
              message={message?.content}
              time={message?.time ?? ""}
              username={
                message?.role === "user" ? message?.role : message?.model
              }
            />
          ))}
      </div>
      <div ref={ref} />
      {isTyping && (
        <div className="absolute bottom-32 border-primary border-2 bg-primary/10 p-2 rounded-lg left-14">
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
    </div>
  ));
