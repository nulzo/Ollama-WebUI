import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import Sidebar from "@/components/elements/sidebar.tsx";
import ResponseBox from "@/components/responseBox.tsx";
import NavBar from "@/components/elements/navbar.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Textarea} from "@/components/ui/textarea";
import {Mic, Paperclip, Send, Image} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Ollama} from "@/services/ollama.ts";
import getModels from "@/api/getModels.ts";
import React, {useState} from "react";
import {ChatResponse, Message} from "@/types/ollama";

export function Dashboard() {
    const allModels = useQuery({queryKey: ['models'], queryFn: getModels});
    const [messages, setMessages] = useState<Message[]>([]);
    const [model, setModel] = useState('');
    const [message, setMessage] = useState('');
    const [indeterminate, setIndeterminate] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [userMessages, setUserMessages] = useState<Message[]>([]);
    const [botMessages, setBotMessages] = useState<Message[]>([]);

    const ollama: Ollama = new Ollama({
        endpoint: 'api',
        host: 'http://192.168.0.25',
        port: 11434
    });

    async function write(response: ChatResponse[]): Promise<(Message | { role: string; content: string })[]> {
        setIsTyping(true);
        let curr: string = '';
        for await (const part of response) {
            curr += part.message.content;
            setIndeterminate(curr + part.message.content);
        }
        setIndeterminate('');
        setIsTyping(false);
        const newHistory = [...botMessages, {role: "assistant", content: curr}];
        setBotMessages(newHistory);
        return newHistory;
    }

    async function onSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        const newHistory: Message[] = [...userMessages, {role: "user", content: message}]
        setUserMessages(newHistory);
        const history:Message[] = ollama.mergeMessageArray(newHistory, botMessages);
        const data = {
            model: model,
            stream: true,
            messages: history,
        };
        setMessage('');
        const response: ChatResponse[] = await ollama.chat(data, {stream: true});
        const botMessage: Message[] = await write(response);
        const mes: Message[] = ollama.mergeMessageArray(newHistory, botMessage);
        setMessages(mes);
    }

    return (
        <div className="grid h-screen w-full pl-[56px]">
            <Sidebar/>
            <div className="flex flex-col">
                <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
                    <NavBar/>
                </header>
                <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="relative hidden flex-col items-start md:flex">
                        <div className="grid w-full items-start gap-6">
                            <fieldset className="grid gap-6 rounded-lg border p-4">
                                <legend className="-ml-1 px-1 text-sm font-medium">
                                    Model Settings
                                </legend>
                                <div className="grid gap-1">
                                    <Label htmlFor="model"><span className="text-primary mr-1">*</span>Model</Label>
                                    {allModels.isLoading ?
                                        <Skeleton className="h-9 w-full rounded-lg"/> :
                                        <Select onValueChange={(value) => setModel(value)}
                                                defaultValue={model}>
                                            <SelectTrigger
                                                id="model"
                                                className="items-start [&_[data-description]]:hidden"
                                            >
                                                <SelectValue placeholder="Select a model"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allModels.data?.models?.map((m: ChatResponse) => (
                                                    <SelectItem key={m.model} value={m.model}>
                                                        {m.model}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    }
                                </div>
                                <div className="grid gap-1">
                                    <Label htmlFor="temperature">Temperature</Label>
                                    <Input id="temperature" type="number" placeholder="0.4"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-1">
                                        <Label htmlFor="top-p">Top P</Label>
                                        <Input id="top-p" type="number" placeholder="0.7"/>
                                    </div>
                                    <div className="grid gap-1">
                                        <Label htmlFor="top-k">Top K</Label>
                                        <Input id="top-k" type="number" placeholder="0.0"/>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset className="grid gap-6 rounded-lg border p-4">
                                <legend className="-ml-1 px-1 text-sm font-medium">
                                    Fine-Tune Model
                                </legend>
                                <div className="grid gap-1">
                                    <Label htmlFor="role">Role</Label>
                                    <Select defaultValue="system">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="system">System</SelectItem>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="assistant">Assistant</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-1">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="You are a..."
                                        className="min-h-[9.5rem]"
                                    />
                                </div>
                            </fieldset>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <ScrollArea
                            className="relative flex h-full max-h-[80vh] min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4">
                            <div className="mx-4">
                                {messages.map((message: Message) => (
                                    <ResponseBox isBot={message.role !== "user"}
                                                 message={message.content}
                                                 username={message.role}
                                    />
                                ))}
                                {isTyping &&  <ResponseBox isBot={true} message={indeterminate} username="assistant"/> }
                            </div>
                        </ScrollArea>
                        <div className="flex flex-col mt-4">
                            <div className="flex-1"/>
                            <div
                                className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
                                <Label htmlFor="chatMessage" className="sr-only">
                                    Chat Message
                                </Label>
                                <Textarea
                                    id="chatMessage"
                                    className="m-0 w-full focus:border-transparent focus-visible:ring-0 resize-none border-0 p-3 shadow-none h-[52px] min-h-[52px] items-center bg-background align-middle"
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                />
                                <div className="flex items-center p-3 pt-0">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Paperclip className="size-3"/>
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
                                                    <Image className="size-3"/>
                                                    <span className="sr-only">Upload Image</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">Upload Image</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Mic className="size-3"/>
                                                    <span className="sr-only">Use Microphone</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">Use Microphone</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <Button type="submit"
                                            disabled={message.length === 0 || model.length === 0}
                                            onClick={onSubmit} size="sm" className="ml-auto gap-1.5 text-foreground">
                                        <Send className="size-3"/>
                                        <span className="sr-only">Send Message</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
