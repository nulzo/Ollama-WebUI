import { isToday, isThisWeek, isThisMonth, isBefore, subMonths } from 'date-fns';
import { Bot, HardDriveDownload, PanelRightClose, PanelRightOpen, Pin, SquarePen, User } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Chat } from '@/services/provider/ollama/ollama.ts';
import { useMemo, useState } from 'react';
import { useConversations } from '@/features/conversation/api/get-conversations';
import { ConversationOptionsDropdown } from './conversation-options-dropdown';
import { Input } from '@/components/ui/input';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
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
  const chats = useConversations();
  const user = useUser();
  const [isExpanded, setExpanded] = useState<boolean>(true);

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
        className={`max-h-screen w-[300px] max-w-[300px] min-h-screen select-none ease-in-out transform transition-transform duration-500 md:relative text-foreground text-sm fixed top-0 left-0 bg-secondary border-r ${isExpanded ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col`}
      >
        <div className="flex px-2 py-2">
          <div className="flex pt-1 justify-between w-full items-center gap-2 px-2">
            <Button
              size="icon"
              variant="ghost"
              type="submit"
              className="font-bold"
              onClick={() => { }}
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
          {skeleton.reverse().map((idx) => (
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

      {/* Chat History Section */}
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
  );
}

function ChatItem({ chat, uuid, updateURL }: any) {
  return (
    <div className="relative group">
      <button
        value={chat.uuid}
        className={`truncate w-full flex justify-between rounded-lg px-3 py-2 hover:bg-accent ${uuid === chat.uuid && 'text-foreground bg-accent'
          }`}
        onClick={() => {
          updateURL(`c=${chat.uuid || ''}`);
        }}
      >
        <div className="flex self-center flex-1 w-full">
          <div className="text-left self-center overflow-hidden w-fit truncate h-[20px]">
            {chat.name || 'New Conversation'}
          </div>
        </div>
      </button>
      <div
        className={`${uuid === chat.uuid ? 'opacity-100' : 'opacity-0'} cursor-pointer h-7 group-hover:opacity-100 z-0 from-accent absolute right-[10px] top-[6px] py-1 pr-2 pl-5 bg-gradient-to-l from-80% to-transparent`}
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
