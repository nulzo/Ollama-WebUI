import { Bot, HardDriveDownload, ArrowUpDown, LifeBuoy, DoorOpen, DoorClosed, MessageSquareCode, PanelRightClose, PanelRightOpen, Pin, SquarePen, User } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { Link, useLocation } from 'react-router-dom';
import { SettingsModal } from '@/features/settings/components/settings-modal';
import logo from '@/assets/cringelogomedium.svg';

import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useUser } from '@/features/authentication/components/auth';
import { cn } from '@/lib/utils';

export default function ConversationHistory(props: any) {
  const user = useUser();
  const route = useLocation();
  const [isExpanded, setExpanded] = useState<boolean>(true);

  return (
    <>
      {!isExpanded && (
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

        <div className='my-1 border border-border' />

        <div className='mb-2'>
          {user?.data ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/logout">
                    <Button variant="ghost" size="icon" className="rounded-lg" aria-label="Models">
                      <DoorOpen className="size-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5} className="bg-accent">
                  Logout
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg" aria-label="Models">
                    <DoorClosed className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5} className="bg-accent">
                  Login
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
          </nav>
        </aside>
      )}
    <div
      className={cn(
        "h-screen overflow-hidden transition-all duration-300 ease-in-out",
        "fixed top-0 left-0 md:relative",
        "bg-secondary border-r flex flex-col",
        isExpanded ? "w-[250px]" : "w-[50px] bg-transparent border-0"
      )}
    >
      {isExpanded ? (
        <>
        {/* Top Section */}
      <div className="flex flex-col">
        <div className="flex px-2 pt-2">
          <div className="flex pt-1 justify-between items-center w-full gap-1 px-1">
            <Button
              size="sm"
              variant="ghost"
              type="submit"
              className="flex justify-between w-full text-sm h-9"
              onClick={() => { }}
            >
              <div className="flex gap-2.5 items-center">
                <img src={logo} alt="logo" className="size-4" />
                New Chat
              </div>
              <SquarePen className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              type="submit"
              className="font-bold"
              onClick={() => setExpanded(!isExpanded)}
            >
              <PanelRightOpen className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center px-3 gap-2.5 w-full pt-2">
          <Button
            size="sm"
            variant="ghost"
            type="submit"
            className="w-full justify-start flex gap-2.5 text-sm h-9"
            onClick={() => { }}
          >
            <Bot className="size-4 group-hover:stroke-foreground transition-colors duration-200" />
            Explore Agents
          </Button>
        </div>
        <div className="flex items-center px-3 gap-2.5 w-full">
          <Button
            size="sm"
            variant="ghost"
            type="submit"
            className="w-full justify-start flex gap-2.5 text-sm group h-9"
            onClick={() => { }}
          >
            <HardDriveDownload className="size-4 group-hover:stroke-foreground transition-colors duration-200" />
            Download Models
          </Button>
        </div>
        <div className="flex items-center px-6 gap-2.5 w-full">
          <MagnifyingGlassIcon className="stroke-muted-foreground size-4" />
          <Input
            className="w-[75%] focus-visible:ring-0 border-0 bg-transparent px-0 hover:ring-0 focus-within:ring-0 focus-within:border-0 focus:ring-0 focus:outline-none focus:border-0"
            placeholder="Search"
          />
        </div>
      </div>

      {/* Popover at Bottom */}
      <div className="px-3 py-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              type="submit"
              className="w-full justify-start flex gap-2.5 items-center text-sm group h-9"
              onClick={() => { }}
            >
              <User className="size-4 group-hover:stroke-primary-foreground transition-colors duration-200" />
              <div>
                {user?.data?.username}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-muted-foreground">
                  Set the dimensions for the layer.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    defaultValue="100%"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxWidth">Max. width</Label>
                  <Input
                    id="maxWidth"
                    defaultValue="300px"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    defaultValue="25px"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxHeight">Max. height</Label>
                  <Input
                    id="maxHeight"
                    defaultValue="none"
                    className="col-span-2 h-8"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
        </>
      ) : (
        <div className="p-1 flex justify-center pt-2">
          <Button
            size="icon"
            variant="ghost"
            type="submit"
            className="font-bold"
            onClick={() => setExpanded(!isExpanded)}
          >
            <PanelRightClose className="size-4" />
          </Button>
        </div>
      )}
    </div>
    </>
  );
}
