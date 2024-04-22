import React from "react";
import {Avatar, Box, Card} from "@radix-ui/themes";
import {FaceIcon} from "@radix-ui/react-icons";

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
            <div className={`my-1 pl-8 flex items-center w-full border rounded-xl ${isBot ? 'min-h-[3em] mt-3 pr-8 p-3 bg-indigo-600/5 border-indigo-400/75' : 'm-0 border-0'}`}>
                <div>{message}</div>
            </div>
        </>
    );
};

export default ResponseBox;