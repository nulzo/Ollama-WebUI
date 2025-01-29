import {
  Bot,
  HardDriveDownload,
  ArrowUpDown,
  LifeBuoy,
  DoorOpen,
  DoorClosed,
  MessageSquareCode,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  SquarePen,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { isToday, isThisWeek, isThisMonth, isBefore, subMonths } from 'date-fns';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { Link, useLocation } from 'react-router-dom';
import { SettingsModal } from '@/features/settings/components/settings-modal.tsx';
import logo from '@/assets/cringelogomedium.svg';
import { useConversations } from '@/features/chat/api/get-conversations.ts';
import { Label } from '@/components/ui/label.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { useUser } from '@/features/authentication/components/auth.tsx';
import { cn } from '@/lib/utils.ts';
import { ConversationOptionsDropdown } from './conversation-options-dropdown.tsx';
import { Chat } from '@/types/chat';

export default function ConversationHistory(props: any) {
  const user = useUser();
  const route = useLocation();
  const [isExpanded, setExpanded] = useState<boolean>(true);
  const chats = useConversations();

  const getDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return 'Today';
    if (isThisWeek(date)) return 'Previous Week';
    if (isThisMonth(date)) return 'This Month';
    if (isBefore(date, subMonths(new Date(), 1))) return 'Last Month';
    return 'Older';
  };

  const skeleton = Array.from({ length: 19 }, (_, i) => (i + 1) / 2);

  const organizeChatsByDate = useMemo(() => {
    if (!chats?.data) return { pinned: [], unpinned: {} };
    const groups = { pinned: [], unpinned: {} };
    chats.data.forEach((chat: any) => {
      if (chat.is_pinned) {
        groups.pinned.push(chat);
      } else {
        const label = getDateLabel(chat.created_at);
        groups.unpinned[label] = groups.unpinned[label] || [];
        groups.unpinned[label].push(chat);
      }
    });

    return groups;
  }, [chats]);

  if (chats.isLoading) {
    return (
      <div
        className={`max-h-screen w-[300px] max-w-[300px] min-h-screen select-none ease-in-out transform transition-transform duration-500 md:relative text-foreground text-sm fixed top-0 left-0 bg-secondary border-r ${
          isExpanded ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="flex px-2 py-2">
          <div className="flex pt-1 justify-between w-full items-center gap-2 px-2">
            <Button
              size="icon"
              variant="ghost"
              type="submit"
              className="font-bold"
              onClick={() => {}}
            >
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
        <div className="px-2 pt-8 font-medium lg:ps-4 flex-1 overflow-y-auto scrollbar space-y-1">
          {skeleton.reverse().map(idx => (
            <div
              key={idx}
              className="z-50 h-8 rounded-lg bg-primary/10 w-full"
              style={{ opacity: idx * 0.1, animationDelay: `${idx * 100}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-screen transition-all duration-300 ease-in-out',
        'fixed top-0 left-0 md:relative',
        'bg-secondary border-r flex flex-col',
        isExpanded ? 'w-[250px]' : 'w-[53px]'
      )}
    >
      {/* Top Section */}
      <div className="flex flex-col overflow-hidden">
        <div className={cn('flex px-2', !isExpanded ? 'mb-2' : 'pt-2 mb-2')}>
          <div className="relative flex pt-1 justify-between items-center w-full gap-1 px-1">
            <Button
              size="sm"
              variant="ghost"
              type="submit"
              className={cn(
                'flex justify-between text-sm h-9 transition-all duration-300',
                isExpanded ? 'w-full' : 'hidden'
              )}
              onClick={() => {}}
            >
              <div className="flex gap-2.5 items-center overflow-hidden">
                <img src={logo} alt="logo" className="size-4 shrink-0" />
                {isExpanded && <span className="truncate">New Chat</span>}
              </div>
              {isExpanded && <SquarePen className="size-4 shrink-0" />}
            </Button>
            {isExpanded && (
              <Button
                size="icon"
                variant="ghost"
                type="submit"
                className="font-bold shrink-0"
                onClick={() => setExpanded(!isExpanded)}
              >
                <PanelRightOpen className="size-4" />
              </Button>
            )}
          </div>
        </div>
        {!isExpanded && (
          <Button
            size="icon"
            variant="ghost"
            type="submit"
            className="font-bold shrink-0 absolute top-2.5 left-16 z-10000"
            onClick={() => setExpanded(!isExpanded)}
          >
            <PanelLeftOpen className="size-4" />
          </Button>
        )}
        <nav
          className={cn(
            'transition-all duration-300 overflow-hidden',
            isExpanded ? 'opacity-100' : 'opacity-0 h-0'
          )}
        >
          {/* Models Button */}
          <div className="flex items-center px-3 gap-2.5 w-full">
            <Button
              size="sm"
              variant="ghost"
              type="submit"
              className="w-full justify-start flex gap-2.5 text-sm font-normal h-9"
              onClick={() => {}}
            >
              <Bot className="size-4 group-hover:stroke-foreground transition-colors duration-200" />
              Explore Agents
            </Button>
          </div>

          {/* Download Models Button */}
          <div className="flex items-center px-3 gap-2.5 w-full">
            <Button
              size="sm"
              variant="ghost"
              type="submit"
              className="w-full justify-start flex gap-2.5 text-sm group h-9 font-normal"
              onClick={() => {}}
            >
              <ArrowUpDown className="size-4 group-hover:stroke-foreground transition-colors duration-200" />
              Download Models
            </Button>
          </div>

          <div className="flex items-center px-6 gap-2.5 w-full">
            <MagnifyingGlassIcon className="stroke-muted-foreground size-4" />
            <Input
              className="w-[75%] focus-visible:ring-0 border-0 bg-transparent px-0 hover:ring-0 focus-within:ring-0 focus-within:border-0 focus:ring-0 focus:outline-hidden focus:border-0"
              placeholder="Search"
            />
          </div>
        </nav>
        <div className="px-2 font-medium lg:ps-4 flex-1 overflow-y-auto scrollbar mt-4">
          {organizeChatsByDate.pinned.length > 0 && (
            <div>
              <div className="flex gap-1 items-center sticky top-0 py-2 text-xs font-semibold text-muted-foreground capitalize">
                <Pin className="size-3" />
                Pinned
                <div className="text-[10px] font-light flex gap-1">
                  {organizeChatsByDate.pinned.length}
                </div>
              </div>
              {organizeChatsByDate.pinned.map((chat: Chat) => (
                <ChatItem key={chat.uuid} chat={chat} {...props} />
              ))}
            </div>
          )}
          {Object.entries(organizeChatsByDate.unpinned)
            .reverse()
            .map(([group, groupChats]: any) => (
              <div key={group}>
                <div className="flex gap-1 items-baseline sticky top-0 py-2 text-xs font-semibold text-muted-foreground capitalize">
                  {group}
                  <div className="text-[10px] font-light flex gap-1 items-center">
                    {groupChats.length}
                  </div>
                </div>
                {groupChats.reverse().map((chat: Chat) => (
                  <ChatItem key={chat.uuid} chat={chat} {...props} />
                ))}
              </div>
            ))}
        </div>
      </div>

      {/* Main Navigation (Collapsed) */}
      <nav
        className={cn(
          'grid gap-1 p-2 pt-0 transition-all duration-300',
          isExpanded ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        )}
      >
        <div className="mb-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/">
                  <Button variant="ghost" size="icon" className="rounded-lg" aria-label="Chat">
                    <img src={logo} alt="logo" className="size-4 shrink-0" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5} className="bg-accent">
                Chat
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

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
                  <Bot className="size-4" />
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
                aria-label="Download Models"
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

      {/* Bottom Navigation */}
      <nav className="mt-auto grid gap-1 p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="mt-auto rounded-lg" aria-label="Help">
                <LifeBuoy className="size-4" />
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

        <div className="my-1 border border-border" />

        <div className="mb-2">
          {user?.data ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/logout">
                    <Button variant="ghost" size="icon" className="rounded-lg" aria-label="Logout">
                      <DoorOpen className="size-4" />
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
                  <Button variant="ghost" size="icon" className="rounded-lg" aria-label="Login">
                    <DoorClosed className="size-4" />
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

      {/* User Popover */}
      <div
        className={cn(
          'px-3 py-4 transition-all duration-300 overflow-hidden',
          isExpanded ? 'opacity-100' : 'opacity-0 h-0'
        )}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              type="submit"
              className="w-full justify-start flex gap-2.5 items-center text-sm group h-9"
              onClick={() => {}}
            >
              <User className="size-4 group-hover:stroke-primary-foreground transition-colors duration-200" />
              <div>{user?.data?.username}</div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Width</Label>
                  <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxWidth">Max. width</Label>
                  <Input id="maxWidth" defaultValue="300px" className="col-span-2 h-8" />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="height">Height</Label>
                  <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxHeight">Max. height</Label>
                  <Input id="maxHeight" defaultValue="none" className="col-span-2 h-8" />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function ChatItem({ chat, uuid, updateURL, isActive }: any) {
  return (
    <div className="relative group">
      <button
        value={chat.uuid}
        className={`w-full flex justify-between rounded-lg px-3 py-2 hover:bg-accent ${
          isActive ? 'text-foreground bg-accent' : ''
        }`}
        onClick={() => {
          updateURL();
        }}
      >
        <div className="flex self-center flex-1 min-w-0">
          <div className="text-left self-center w-full truncate h-[20px]">
            {chat.name || 'New Conversation'}
          </div>
        </div>
      </button>
      <div
        className={`${isActive ? 'opacity-100' : 'opacity-0'} cursor-pointer h-7 group-hover:opacity-100 z-0 from-accent absolute right-[10px] top-[6px] py-1 pr-2 pl-5 bg-linear-to-l from-80% to-transparent`}
      >
        <ConversationOptionsDropdown
          name={chat.name}
          is_pinned={chat.is_pinned}
          conversationID={chat.uuid ?? ''}
        />
      </div>
    </div>
  );
}
