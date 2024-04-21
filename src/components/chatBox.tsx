import React, {useRef, useState} from "react";
import {Button} from "@radix-ui/themes";
import {RocketIcon} from "@radix-ui/react-icons";

interface Props {
    onSendMessage: (message: string) => void;
}

const ChatBox: React.FC<Props> = ({onSendMessage}) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const ref = useRef<HTMLTextAreaElement>(null);
    const minHeight = 52;

    const handleSendMessage = () => {
        if (!message.trim()) return;
        setIsSending(true);
        onSendMessage(message);
        setMessage('');
    };

    const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const inputHeight = event.target.scrollHeight;
        setMessage(event.target.value);
        if(ref.current) {
            ref.current.style.height = `${inputHeight > minHeight ? inputHeight - 16 : minHeight}px`;
            ref.current.style.overflowY = inputHeight > 250 ? "auto" : "hidden";
        }
    };

    return (
        <div className="relative flex h-full flex-1 flex-col">
            <div className="flex w-full items-center">
                <div
                    className="overflow-hidden transition-colors border-2 items-center align-middle border-white/50 [&:has(textarea:focus)]:border-indigo-500 [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)] flex flex-col w-full flex-grow relative dark:text-white rounded-xl">
                <textarea
                    value={message}
                    ref={ref}
                    onChange={handleMessageChange}
                    className="m-0 w-full h-[52px] resize-none items-center align-middle border-0 bg-transparent pt-2 focus:ring-0 focus-visible:ring-0 dark:bg-transparent py-[10px] pr-10 md:py-2 md:pr-12 max-h-52 placeholder-black/50 dark:placeholder-white/50 pl-4 md:pl-6"
                />
                    <div className="absolute bottom-2.5 right-3">
                        <Button onClick={handleSendMessage} disabled={isSending || (message.length === 0)}>
                            <RocketIcon/>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;