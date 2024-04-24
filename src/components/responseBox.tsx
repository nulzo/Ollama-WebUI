import React from "react";
import {Avatar, Box} from "@radix-ui/themes";
import {FaceIcon} from "@radix-ui/react-icons";
import MarkdownRenderer from "../helpers/markdown";

interface ResponseBox {
    username: string;
    message: string;
    isBot: boolean
}

const ResponseBox: React.FC<ResponseBox> = ({username, message, isBot}) => {
    return (
        <>
            <div className={`font-bold flex items-center`}>
                <Avatar color={isBot ? 'indigo' : 'gray'} size="1" radius="full" fallback={
                    <Box><FaceIcon width="16" height="16"/></Box>
                }>
                </Avatar>
                <span className="px-1.5">{username}</span>
            </div>
            <div className='my-1 pl-8 flex items-center w-full rounded-xl m-0 border-0'>
                {/* <div>{message}</div> */}
                <MarkdownRenderer markdown={message}/>
            </div>
        </>
    );
};

export default ResponseBox;