import React from "react";
import MarkdownRenderer from "../helpers/markdown.tsx";
import {Smile, Origami, Ghost} from "lucide-react";
import LoadingSpinner from "@/components/loadingSpinner.tsx";

interface ResponseBox {
    username: string;
    message: string;
    isBot: boolean;
    isTyping: boolean;
}

const ResponseBox: React.FC<ResponseBox> = ({username, message, isBot, isTyping}) => {
    return (
        <div className="py-2">
            <div className='font-bold flex items-center mb-2'>
                {!isBot && <Ghost className="size-4" />}
                {isBot && (isTyping
                        ? <Origami className="size-4 text-primary animate-pulse"/>
                        : <Origami className="size-4 text-primary"/>
                )}
                <span className="px-1.5">{username}</span>
            </div>
            <div className="bg-background/50 border rounded-xl py-3">
                <div className='my-1 px-8 flex items-center w-full rounded-xl m-0 border-0'>
                    {(isTyping && (message.length <= 1 || !message || message === '<empty string>')) ? <LoadingSpinner color="#fb923c" /> : <MarkdownRenderer markdown={message}/> }
                </div>
            </div>
        </div>
    );
};

export default ResponseBox;