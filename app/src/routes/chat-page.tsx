import { useEffect, useRef } from "react";
import ChatDrawer from "@/components/display/chat-drawer.tsx";
import { Textbox } from "@/components/chat/textbox/textbox.tsx";
import { useChat } from "@/hooks/use-chat";
import { Header } from "@/components/display/header.tsx";
import { ChatArea } from "@/components/display/chat-area.tsx";
import { useSearchParams } from 'react-router-dom'

export function ChatPage() {
  const {
    model,
    uuid,
    message,
    isTyping,
    messages,
    setModel,
    setMessage,
    handleSubmit,
    createChat,
    getChatHistory,
  } = useChat();

  const [searchParams, setSearchParams] = useSearchParams();

  const ref = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function updateModel(param: string) {
    setModel(param);
  }

  useEffect(() => {
    const search: string | null = searchParams.get("c");
    if(search) {
      getChatHistory(search);
    }
  }, []);

  return (
    <>
      <ChatDrawer
        updateModel={updateModel}
        createChat={createChat}
        getChatHistory={getChatHistory}
        uuid={uuid}
        model={model}
        updateURL={setSearchParams}
      />
      <div className="h-screen max-h-[100dvh] md:max-w-[calc(100%-260px)] w-full max-w-full flex flex-col">
        <Header model={model} setModel={setModel} />
        <div className="relative flex flex-col flex-auto z-10">
          <ChatArea messages={messages} isTyping={isTyping} model={model} ref={ref} />
          <div className="mb-5 z-[99]">
            <div className="-mb-3.5 mx-auto inset-x-0 bg-transparent flex justify-center"></div>
            <Textbox
              value={message}
              setValue={setMessage}
              onSubmit={handleSubmit}
              model={model}
            />
          </div>
        </div>
      </div>
    </>
  );
}
