import {Button} from "@/components/ui/button.tsx";
import {ArrowUpDown, Bot, LifeBuoy, MessageSquareCode, SquareUser} from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

const Sidebar = () => {
    return (
        <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
            <div className="mt-1 p-2">
                <Button variant="outline" size="icon" aria-label="Home">
                    <img className="rounded-xl" src="https://avatars.githubusercontent.com/u/65730528?v=4" alt="nulzo" />
                </Button>
            </div>
            <nav className="grid gap-1 p-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-lg bg-muted"
                                aria-label="Chat"
                                id="chat"
                                key="chat"
                            >
                                <MessageSquareCode id="chat" className="size-5"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5} className="bg-accent">
                            Chat
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-lg"
                                aria-label="Models"
                            >
                                <Bot className="size-5"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5} className="bg-accent">
                            Models
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-lg"
                                aria-label="Models"
                            >
                                <ArrowUpDown className="size-4"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5} className="bg-accent">
                            Download Models
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </nav>
            <nav className="mt-auto grid gap-1 p-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mt-auto rounded-lg"
                                aria-label="Help"
                            >
                                <LifeBuoy className="size-5"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5} className="bg-accent">
                            Help
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="mt-auto rounded-lg"
                                aria-label="Account"
                            >
                                <SquareUser className="size-5"/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5} className="bg-accent">
                            User Settings
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </nav>
        </aside>
    );
}

export default Sidebar;
