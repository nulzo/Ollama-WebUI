import React, {useRef, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import { Mic, Paperclip, Send} from "lucide-react";
import {Label} from "@/components/ui/label.tsx";

const ChatBox: any = ({formField}) => {
    console.log(formField)
    return (
        <>
            <Label htmlFor="chatMessage" className="sr-only">
                Chat Message
            </Label>
            <textarea
                    id="chatMessage"
                    className="m-0 w-full focus-visible:ring-0 resize-none border-0 p-3 shadow-none h-[52px] min-h-[52px] items-center bg-background align-middle"
                    {...formField}
            />
            <div className="flex items-center p-3 pt-0">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Paperclip className="size-4"/>
                                <span className="sr-only">Attach file</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Attach File</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Mic className="size-4"/>
                                <span className="sr-only">Use Microphone</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Use Microphone</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <Button type="submit" size="sm" className="ml-auto gap-1.5 text-foreground">
                    <Send className="size-4"/>
                    <span className="sr-only">Send Message</span>
                </Button>
            </div>
        </>
    );
};

export default ChatBox;