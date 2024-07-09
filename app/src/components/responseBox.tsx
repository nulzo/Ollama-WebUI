import React from "react";
import MarkdownRenderer from "../helpers/markdown.tsx";
import { Smile, Origami, Ghost } from "lucide-react";
import LoadingSpinner from "@/components/loadingSpinner.tsx";

interface ResponseBox {
  username: string;
  message: string;
  isBot: boolean;
  isTyping: boolean;
}

const ResponseBox: React.FC<ResponseBox> = ({
  username,
  message,
  isBot,
  isTyping,
}) => {
  return (
    <div className="py-2 flex place-items-start justify-end">
      {isBot && (
        <>
          <div className="pt-4 pe-2 font-bold flex items-center mb-2">
            <div className="p-3 bg-primary rounded-full">
              {!isBot && <Ghost className="size-4" />}
              {isBot &&
                (isTyping ? (
                  <Origami className="size-4 text-primary animate-pulse" />
                ) : (
                  <Origami className="size-4 text-primary" />
                ))}
            </div>
          </div>
          <div>
            <span className="font-semibold text-sm">{username}</span>
            <div className="bg-background/50 border rounded-e-2xl rounded-b-2xl pt-3">
              <div className="px-5 flex items-center w-full m-0 border-0">
                {isTyping &&
                (message.length <= 1 ||
                  !message ||
                  message === "<empty string>") ? (
                  <LoadingSpinner color="#fb923c" />
                ) : (
                  <MarkdownRenderer markdown={message} />
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {!isBot && (
        <>
          <div className="">
            <span className="flex justify-end font-semibold text-sm">
              {username}
            </span>
            <div className="bg-background/50 border rounded-s-2xl rounded-b-2xl pt-3">
              <div className="px-5 flex items-center w-full m-0 border-0">
                {isTyping &&
                (message.length <= 1 ||
                  !message ||
                  message === "<empty string>") ? (
                  <LoadingSpinner color="#fb923c" />
                ) : (
                  <MarkdownRenderer markdown={message} />
                )}
              </div>
            </div>
          </div>
          <div className="pt-4 ps-2 font-bold flex items-center mb-2">
            <div className="p-3 bg-primary rounded-full">
              <Ghost className="size-4" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResponseBox;
