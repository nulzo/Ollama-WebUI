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
            <div className={`font-bold flex items-center ${isBot ? 'justify-start' : 'justify-end'}`}>
                <Avatar size="2" radius="large" fallback={
                    <Box><FaceIcon width="20" height="20"/></Box>
                }>
                </Avatar>
                <span className="px-2">{username}</span>
            </div>
            <Card className="my-2 p-1 w-full min-h-[3em]">
                <div>{message}</div>
            </Card>
        </>
    );
};

export default ResponseBox;