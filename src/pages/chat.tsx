import ResponseBox from "../components/responseBox.tsx";
import {Button, Select, Text} from "@radix-ui/themes";
import {useRef, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import postChat, {Chat} from "../api/postChat.ts";
import {Controller, useForm} from "react-hook-form";
import {RocketIcon} from "@radix-ui/react-icons";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import getModels from "../api/getModels.ts";

const FormSchema = z.object({
    message: z
        .string({required_error: "You must enter data!"})
        .min(1, {message: "You must enter data!"}),
    model: z.string().min(1)
});

interface Response {
    content: string;
    role: string
    model: string
}

export default function ChatPage() {
    const [response, setResponse] = useState<Response>([]);
    const queryClient = useQueryClient();
    const ref = useRef<HTMLTextAreaElement>(null);
    const allModels = useQuery({queryKey: ['models'], queryFn: getModels})
    const mutation = useMutation({
        mutationFn: (formData: Chat) => {
            formData.messages = response;
            return postChat(formData);
        },
        mutationKey: ["chats"],
        onSuccess: (result) => {
            queryClient.setQueryData(["chats"], result);
            const newMessageHistory = [...response, {
                content: result.message.content,
                role: "assistant",
                model: result.model
            }];
            setResponse(newMessageHistory);
        },
    });

    const {handleSubmit, control, watch, reset} = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            message: "",
            model: "cringe"
        }
    });

    const minHeight: number = 52;
    const formInputs = watch();

    async function onSubmit(form: any) {
        const formData = {
            model: form.model,
            stream: false,
            messages: [
                {
                    role: "user",
                    content: form.message,
                },
            ],
        };
        console.log("FORM DATA: ", formData)
        mutation.mutate(formData);
        const newMessageHistory = [...response, {
            content: form.message,
            role: "user",
            model: "none"
        }];
        setResponse(newMessageHistory);
        reset();
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit(formInputs);
        }
        const inputHeight = event.target.scrollHeight;
        if (ref.current) {
            ref.current.style.height = `${inputHeight > minHeight ? inputHeight - 16 : minHeight}px`;
            ref.current.style.overflowY = inputHeight > 250 ? "auto" : "hidden";
        }
    };

    return (
        <main className="grid flex-1 overflow-auto text-wrap">
            <div className="relative w-full hidden flex-col items-start md:flex">
                <div className="relative w-full whitespace-pre-wrap">
                    <div
                        className="px-2 bg-transparent rounded-sm flex justify center content-center cursor-default w-full appearance-none">
                        <div className="h-[calc(100vh-250px)] w-full rounded-xl px-12 overflow-auto">
                            <div className="whitespace-pre-line w-full pr-4">
                                {response &&
                                    response.map((chat) => (
                                        <>
                                            {console.log(chat)}
                                        <div className="py-1">
                                            {chat.role === "user" ? (
                                                <ResponseBox
                                                    message={chat.content}
                                                    username="You"
                                                    isBot={false}
                                                />
                                            ) : (
                                                <ResponseBox
                                                    message={chat.content}
                                                    username={chat.model}
                                                    isBot={true}
                                                />
                                            )}
                                        </div>
                                        </>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                    <div className="absolute w-full px-10 justify-center items-center">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="relative items-center h-full gap-4 grid grid-cols-8 flex-1 flex-col">
                                <div className="col-span-1 flex-1 flex-col">
                                    {!allModels.isLoading && <Controller
                                        control={control}
                                        name="model"
                                        render={({field}) => (
                                            <Select.Root size="2" value={field.value} onValueChange={field.onChange}>
                                                <Select.Trigger radius="large" style={{height: `${52}px`}} className="w-full"/>
                                                <Select.Content className="rounded">
                                                    <Select.Group>
                                                        <Select.Label>Your Local Models</Select.Label>
                                                        {allModels.data?.models?.map(m => (
                                                            <Select.Item {...field} key={m.model} value={m.model}>
                                                                {m.model}
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Group>
                                                </Select.Content>
                                            </Select.Root>
                                        )}
                                    />}
                                </div>
                                <div className="flex col-span-7 w-full items-center">
                                    <div
                                        className="overflow-hidden flex transition-colors border-2 border-white/50 [&:has(textarea:focus)]:border-[#3E63DD] flex-col w-full flex-grow relative dark:text-white rounded-xl">
                                        <Controller
                                            control={control}
                                            name="message"
                                            render={({field}) => (
                                                <textarea
                                                    value={field.value}
                                                    ref={ref}
                                                    onKeyDown={handleKeyDown}
                                                    onChange={field.onChange}
                                                    style={{paddingTop: `${.85}rem`}}
                                                    className="m-0 w-full flex h-[52px] resize-none items-center align-middle border-0 bg-transparent focus:ring-0 focus-visible:ring-0 dark:bg-transparent py-[10px] pr-10 md:py-2 md:pr-12 max-h-52 placeholder-black/50 dark:placeholder-white/50 pl-4 md:pl-6"
                                                />
                                            )}
                                        />
                                        <div className="absolute bottom-2.5 right-3">
                                            <Button type="submit" disabled={formInputs?.message.length === 0}>
                                                <RocketIcon/>
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </form>
                        <div className="flex p-0 pt-3 w-full justify-center items-center">
                            <Text color="gray" weight="light" size="1">
                                Please remember to use AI responsibly.
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}