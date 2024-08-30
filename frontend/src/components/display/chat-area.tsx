import { forwardRef } from "react";
import Message from "@/features/message/components/message";
import { Message as Msg } from "@/types/providers/ollama";
import { PulseLoader } from "react-spinners";
import { Origami } from "lucide-react";

export const ChatArea = forwardRef<HTMLDivElement, { messages: Msg[], model: string, isTyping: boolean }>(({ messages, model, isTyping }, ref) => (
  <div className="relative pb-8 flex flex-col justify-between w-[100%] flex-auto overflow-auto h-0 max-w-full z-10 scrollbar-hidden">
    <div className="relative w-full md:max-w-lg lg:max-w-2xl xl:max-w-4xl 2xl:max-w-6xl mx-auto">
      {messages.length !== 0 &&
        messages.map((message) => (
          <Message
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
  </div>
));
