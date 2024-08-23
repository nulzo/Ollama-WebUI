import { Button } from "@/components/ui/button.tsx";
import {
  ArrowUpDown,
  Bot,
  LifeBuoy,
  MessageSquareCode,
  Settings2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const route = useLocation();
  console.log(route);
  return (
    <aside className="bg-accent/75 inset-y fixed left-0 z-20 flex h-full flex-col border-r">
      <nav className="grid gap-1 p-2 mt-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-lg mb-4`}
                  aria-label="Chat"
                  id="chat"
                  key="chat"
                >
                  <img
                    className="rounded-xl size-7"
                    src="https://avatars.githubusercontent.com/u/65730528?v=4"
                    alt="nulzo"
                  />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5} className="bg-accent">
              Chat
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-lg ${
                    route.pathname === "/" ? "bg-muted" : ""
                  }`}
                  aria-label="Chat"
                  id="chat"
                  key="chat"
                >
                  <MessageSquareCode id="chat" className="size-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5} className="bg-accent">
              Chat
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/models">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-lg ${
                    route.pathname === "/models" ? "bg-muted" : ""
                  }`}
                  aria-label="Models"
                >
                  <Bot className="size-5" />
                </Button>
              </Link>
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
                <ArrowUpDown className="size-4" />
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
                <LifeBuoy className="size-5" />
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
                <Settings2 className="size-5" />
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
};

export default Sidebar;
