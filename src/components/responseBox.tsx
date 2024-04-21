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
                <Avatar size="2" radius="large" fallback={
                    <Box><FaceIcon width="20" height="20"/></Box>
                }>
                </Avatar>
                <span className="px-2">{username}</span>
            </div>
            <div className={`my-1 pl-4 p-3 flex items-center w-full min-h-[3em] border rounded  ${isBot ? 'bg-indigo-600/5 border-indigo-400/75' : 'border-white/20 bg-gray-700/5'}`}>
                <div>{message}</div>
            </div>
        </>
    );
};

export default ResponseBox;