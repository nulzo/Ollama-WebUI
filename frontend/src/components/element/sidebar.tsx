import { Button } from '@/components/ui/button.tsx';
import { ArrowUpDown, Bot, LifeBuoy, MessageSquareCode } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { Link, useLocation } from 'react-router-dom';
import { SettingsModal } from '@/features/settings/components/settings-modal';
import logo from '@/assets/cringelogomedium.svg';

const Sidebar = () => {
  const route = useLocation();
  return (
    <aside className="bg-tertiary inset-y flex left-0 z-20 h-full flex-col border-r w-[53px]">
      <nav className="mt-1 grid gap-1 p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-lg mb-3`}
                  aria-label="Chat"
                  id="chat"
                  key="chat"
                >
                  <img className="rounded size-8" src={logo} alt="nulzo" />
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
                  className={`rounded-lg ${route.pathname === '/' ? 'bg-muted' : ''}`}
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
                  className={`rounded-lg ${route.pathname === '/models' ? 'bg-muted' : ''}`}
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
              <Button variant="ghost" size="icon" className="rounded-lg" aria-label="Models">
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
              <Button variant="ghost" size="icon" className="mt-auto rounded-lg" aria-label="Help">
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
              <SettingsModal />
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
