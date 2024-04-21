import NavBar from "./components/elements/navbar.tsx";
import {ScrollArea, Text} from "@radix-ui/themes";
import {useEffect, useState} from "react";
import SummarizeForm from "./forms/chat.tsx";
import Sidebar from "./components/elements/sidebar.tsx";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import postChat, {Chat} from "./api/postChat.ts";
import ResponseBox from "./components/responseBox.tsx";

export default function Root() {
    const [response, setResponse] = useState([]);
    const defaultMessage = "Hey! I am here to help :)";
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (formData: Chat) => {
            return postChat(formData);
        },
        mutationKey: ['chats'],
        onSuccess: (result) => {
            queryClient.setQueryData(['chats'], result)
            const newMessageHistory = [...response, result];
            setResponse(newMessageHistory);
        },
    });

    const handleMessageSend = (newMessage: Chat) => {
        if (newMessage?.messages) {
            mutation.mutate(newMessage);
        }
        const newMessageHistory = [...response, newMessage];
        setResponse(newMessageHistory);
    }

    useEffect(() => {
        console.log("RESPONSE CHANGED: ", response);
    }, [response]);

    return (
        <div>
            <NavBar/>
            <div className="grid grid-cols-12 h-[calc(100vh-50px)]">
                <Sidebar/>
                <div className="relative col-span-10 mx-32 lg:mx-24">
                    <div
                        className="px-2 pt-10 bg-transparent rounded-sm flex justify center content-center cursor-default w-full appearance-none">
                        <ScrollArea size="1" type="always" scrollbars="vertical" style={{ height: `${80}vh` }}>
                            <div className="whitespace-pre-line w-full pr-4">
                                <div className="pb-4">
                                    {response ? response.map(chat => (
                                            <div className="py-3">
                                                {chat.message?.content ?
                                                    <ResponseBox message={chat.message?.content}
                                                                 username="Cringe"
                                                                 isBot={true}
                                                    />
                                                : <ResponseBox message={chat.messages[0].content}
                                                               username="user"
                                                               isBot={false}
                                                    />
                                                }
                                            </div>
                                        )
                                    ) : <ResponseBox message={defaultMessage} username="Cringe" isBot={true}/>
                                    }
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="absolute w-full bottom-4 justify-center items-center">
                        <SummarizeForm setResponse={handleMessageSend}/>
                        <div className="flex p-0 pt-3 w-full justify-center items-center">
                            <Text color="gray" weight="light" size="1">Please remember to use AI responsibly.</Text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
