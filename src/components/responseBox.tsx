import React from "react";
import MarkdownRenderer from "../helpers/markdown.tsx";
import {SquareUser} from "lucide-react";
import LoadingSpinner from "@/components/loadingSpinner.tsx";

interface ResponseBox {
    username: string;
    message: string;
    isBot: boolean;
    isLoading: boolean;
}

const ResponseBox: React.FC<ResponseBox> = ({username, message, isBot, isLoading}) => {
    return (
        <div className="py-2">
            <div className='font-bold flex items-center mb-2'>
                {!isBot && <SquareUser/>}
                {isBot && ( isLoading
                        ? <img
                            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Exploding%20Head.png"
                            alt="Exploding Head" width="25" height="25"/>
                        : <img src="src/assets/exploding_head_3d.png" width="25" height="25"  alt="Exploded Head" />
                )}
                <span className="px-1.5">{username}</span>
            </div>
            <div className="bg-background/50 border rounded-xl py-3">
                <div className='my-1 px-8 flex items-center w-full rounded-xl m-0 border-0'>
                    {isLoading ? <LoadingSpinner color="#fb923c" /> : <MarkdownRenderer markdown={message}/> }
                </div>
            </div>
        </div>
    );
};

export default ResponseBox;