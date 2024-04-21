import NavBar from "./components/navbar";
import { Heading, Separator, Text} from "@radix-ui/themes";
import { SetStateAction, useCallback, useState} from "react";
import ChatBox from "./components/chatBox.tsx";
import ResponseBox from "./components/responseBox.tsx";

export default function Root() {
    const [response, setResponse] = useState({data: "", query: "", role: "", loading: false});
    const defaultMessage = "Hey! I am here to help :)"

    const wrapperSetResponse = useCallback((val: SetStateAction<any>) => {
        setResponse(val);
    }, [setResponse]);

    return (
        <div>
            <NavBar />
            <div className="grid grid-cols-12">
                <div className="col-span-2 border-r dark:border-white/50 h-[96vh] items-center">
                    <div className="mx-4 my-6">
                        <div className="mb-4 flex justify-between items-end">
                            <div>
                                <Heading size="7">Model Parameters</Heading>
                                <Heading color="gray" size="1" weight="medium" >Fine-tune your model based on your specific needs</Heading>
                            </div>
                        </div>
                        <Separator size="4" />
                    </div>
                </div>
                <div className="relative col-span-10 mx-32 lg:mx-24 my-6">
                    <div className="px-2 pt-10 bg-transparent rounded-sm flex justify center content-center cursor-default w-full appearance-none" >
                        <div className="whitespace-pre-line w-full">
                            <div className="pb-4">
                                <ResponseBox message={`${response.data ? response.data : defaultMessage}`}
                                             username="Cringe" isBot={true}/>
                            </div>
                        </div>
                    </div>
                    <div className="absolute w-full bottom-0 justify-center items-center">
                        <ChatBox onSendMessage={wrapperSetResponse}/>
                        <div className="flex p-0 pt-4 w-full justify-center items-center">
                            <Text color="gray" weight="light" size="1">Please remember to use AI responsibly.</Text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
