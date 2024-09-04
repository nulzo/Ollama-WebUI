import { useEffect } from "react";
import { Textbox } from "@/features/textbox/components/textbox";
import { useChat } from "@/hooks/use-chat";
import { useSearchParams } from "react-router-dom";
import { Origami } from "lucide-react";
import { PulseLoader } from "react-spinners";
import useScrollToEnd from "@/hooks/use-scroll-to-end";
import { ConversationArea } from "@/features/conversation/components/conversation-area";
import Message from "@/features/message/components/message";
import { useModelStore } from "@/features/models/store/model-store";
import ConversationHistory from "@/features/conversation/components/conversation-history.tsx";
import {ConversationAreaHeader} from "@/features/conversation/components/conversation-area-header.tsx";

export function ChatRoute() {
  const {
    uuid,
    message,
    isTyping,
    messages,
    setMessage,
    handleSubmit,
    createChat,
    getChatHistory,
  } = useChat();

  const [searchParams, setSearchParams] = useSearchParams();

  const searchParamString = searchParams.get("c");

  const ref = useScrollToEnd(messages);

  useEffect(() => {
    if (searchParamString) {
      getChatHistory(searchParamString);
    }
  }, [searchParamString, getChatHistory]);

  const { model} = useModelStore(state => ({
    model: state.model
  }));

  return (
    <>
      <ConversationHistory
        createChat={createChat}
        getChatHistory={getChatHistory}
        uuid={uuid}
        updateURL={setSearchParams}
      />
      {/*<div className="-z-10 absolute blur-2xl w-screen h-screen bg-[radial-gradient(at_56%_42%,_hsla(240,100%,70%,0.2)_0px,_transparent_50%),_radial-gradient(at_62%_61%,_hsla(302,65%,63%,0.1)_0px,_transparent_50%)]"/>*/}
      <div className="transition w-full max-w-full flex flex-col">
        <ConversationAreaHeader />
        <div className="transition relative flex flex-col flex-auto z-10">
          <ConversationArea>
            <>
              {messages.length !== 0 &&
                messages.map((message, index) => (
                  <Message
                    key={`message-${message.id}-${index}`}
                    id={message?.id ?? ""}
                    isBot={message?.role !== "user"}
                    isTyping={false}
                    message={message?.content}
                    time={message.created_at}
                    username={message?.role === "user" ? message?.role : message?.model}
                  />
                ))}
              <div ref={ref} />
            </>
          </ConversationArea>
          <div className="mb-5 z-[99]">
            <div className="-mb-3.5 mx-auto inset-x-0 bg-transparent flex justify-center">
              <div className="mx-auto flex flex-col max-w-4xl justify-center px-2.5 md:px-6 w-full">
                <div className="relative flex justify-center">
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30 pointer-events-none">
                    {isTyping && (
                      <div className="mx-auto z-50 bg-primary/10 backdrop-blur p-2 rounded-lg left-0">
                        <div className="flex gap-2 items-center">
                          <Origami className="size-5" strokeWidth="1" /> {model?.model}{" "}
                          is typing{" "}
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
                </div>
              </div>
              <div className="w-full relative"></div>
            </div>
            <Textbox
              value={message}
              setValue={setMessage}
              onSubmit={handleSubmit}
              model={model?.name || ""}
            />
          </div>
        </div>
      </div>
    </>
  );
}
