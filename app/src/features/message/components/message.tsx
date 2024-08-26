import React from 'react';
import MarkdownRenderer from '@/components/markdown/markdown';
import { Origami, Copy, Sparkles, Heart, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/loadingSpinner.tsx';
import { formatDistanceToNow } from 'date-fns';
import { Message as MessageType } from '@/features/message/types/message';


function calculateAge(timestamp: string) {
    const date = new Date(timestamp);
    return formatDistanceToNow(date) + ' ago';
}

const Message: React.FC<MessageType> = (
    { username, message, isBot, isTyping, time }
) => {
    return (
        <div className='py-3'>
        <span className={`text-sm items-baseline gap-1 py-0 my-0 pb-1 leading-none font-semibold flex place-items-start pl-6 ${isBot ? 'text-muted-foreground ps-11' : 'text-muted-foreground flex justify-end'}`}>
          { isBot && `${username}`}
            <span className='text-xs font-light'>{time ? calculateAge(time) : "just now"}</span>
        </span>
            <div className={`flex place-items-start ${isBot ? 'justify-start' : 'justify-end ps-[25%]'}`}>
                <div className="pe-2 font-bold flex items-center mb-2">
                    {isBot && (
                        <div className="relative p-2 bg-primary rounded-lg rounded-tr-none">
                            <Origami strokeWidth='1' className="size-5 text-primary-foreground" />
                            <div className='absolute -right-0.5 -bottom-0.5 rounded-full h-2 w-2 bg-green-400'/>
                        </div>
                    )}
                </div>
                <div className={`${isBot && 'max-w-[75%]'}`}>
                    <div className={`pt-2 pb-3 ${isBot ? 'bg-accent/75 rounded-e-xl rounded-b-xl' : 'bg-primary/25 rounded-s-xl rounded-b-xl'}`}>
                        <div className="px-4 flex items-center w-full m-0 border-0">
                            {isTyping && (message.length <= 1 || !message || message === "<empty string>") ? (
                                <LoadingSpinner color="#fb923c" />
                            ) : (
                                <MarkdownRenderer markdown={message.trim()} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isBot && (
                <div className='ms-12 mt-1.5 flex gap-2'>
                    <Heart className='size-3 stroke-muted-foreground hover:stroke-red-400 hover:cursor-pointer' />
                    <Copy className='size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer' />
                    <Sparkles className='size-3 stroke-muted-foreground hover:stroke-yellow-400 hover:cursor-pointer' />
                    <RefreshCw className='size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer' />
                </div>
            )}
        </div>
    );
};

export default Message;
