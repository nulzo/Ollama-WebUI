import React from 'react';
import MarkdownRenderer from '@/features/markdown/components/markdown';
import {Copy, Sparkles, Heart, RefreshCw} from 'lucide-react';
import {Message as MessageType} from '@/features/message/types/message';
import {BotIcon} from "@/features/message/components/bot-icon";
import {formatDate} from "@/utils/format.ts";


const Message: React.FC<MessageType> = (
    {username, message, isBot, time, id}
) => {
    const formattedDate = formatDate(time);
    return (
        <div className='py-3'>
            <span className={`text-sm items-baseline gap-1 py-0 my-0 pb-1 leading-none font-semibold flex place-items-start pl-6 ${isBot ? 'text-muted-foreground ps-11' : 'text-muted-foreground flex justify-end'}`}>
              {isBot && `${username}`}
                <span className='text-[10px] font-base text-muted-foreground/50'>
                    {formattedDate ?? ""}
                </span>
            </span>
            <div className={`flex place-items-start ${isBot ? 'justify-start' : 'justify-end ps-[25%]'}`}>
                <div className="pe-2 font-bold flex items-center mb-2">
                    {isBot && <BotIcon/>}
                </div>
                <div className={`${isBot && 'max-w-[75%]'}`}>
                    <div
                        className={`pb-4 px-1 ${isBot ? ' rounded-e-xl rounded-b-xl' : 'pt-3 px-4 bg-primary/25 rounded-s-xl rounded-b-xl backdrop-blur'}`}>
                        <div className="flex items-center w-full m-0 border-0">
                            <MarkdownRenderer markdown={message?.trim() ?? "ERROR"}/>
                        </div>
                    </div>
                </div>
            </div>
            {isBot && (
                <div className='ms-12 flex gap-2'>
                    <Heart className='size-3 stroke-muted-foreground hover:stroke-red-400 hover:cursor-pointer'/>
                    <Copy className='size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer'/>
                    <Sparkles className='size-3 stroke-muted-foreground hover:stroke-yellow-400 hover:cursor-pointer'/>
                    <RefreshCw className='size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer'/>
                </div>
            )}
        </div>
    );
};

export default Message;
