import { useEffect, useRef } from "react";
import ChatDrawer from "@/components/chat-drawer";
import { Textbox } from "@/components/textbox";
import { useChat } from "@/hooks/use-chat";
import { Header } from "@/components/header";
import { ChatArea } from "@/components/chat-area";

export function ChatPage() {
  const {
    model,
    uuid,
    message,
    isTyping,
    messages,
    loading,
    setModel,
    setMessage,
    handleSubmit,
    createChat,
    getChatHistory,
  } = useChat();

  const ref = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function updateModel(param: any) {
    setModel(param);
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
