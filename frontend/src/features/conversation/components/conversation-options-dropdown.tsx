import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteConversation } from '../api/delete-conversation';
import { Pen, Pin, Trash } from 'lucide-react';

interface ConversationOptionsDropdownProps {
    conversationID: string;
}

export const ConversationOptionsDropdown = ({ conversationID }: ConversationOptionsDropdownProps) => {
    const deleteChat = useDeleteConversation();
    return (     
        <div className="flex self-center space-x-1">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <DotsHorizontalIcon className="hover:stroke-primary self-center transition" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[150px]">
                    <DropdownMenuGroup>
                        <DropdownMenuItem className="gap-2 items-center">
                            <Pin className="size-3" /> Pin
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 items-center">
                            <Pen className="size-3" /> Rename
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => deleteChat.mutate({ conversationID: conversationID })} className="flex gap-2 items-center group focus:bg-destructive">
                        <Trash className="size-3.5 group-hover:stroke-destructive-foreground text-destructive" />
                        <span className="group-hover:text-destructive-foreground text-destructive">Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}