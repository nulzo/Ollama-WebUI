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
import { Pen, Pin, PinOff, Trash } from 'lucide-react';
import { useUpdateConversation } from '../api/update-conversation';

interface ConversationOptionsDropdownProps {
  conversationID: string;
  is_pinned: boolean;
  name: string;
}

import { useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export const ConversationOptionsDropdown = ({
  conversationID,
  is_pinned,
  name,
}: ConversationOptionsDropdownProps) => {
  const deleteChat = useDeleteConversation();
  const updateChat = useUpdateConversation();
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newName, setNewName] = useState(name);

  const handlePinToggle = () => {
    updateChat.mutate({
      data: {
        uuid: conversationID,
        is_pinned: !is_pinned,
      },
      conversationID: conversationID,
    });
  };

  const handleChangeName = useCallback(() => {
    updateChat.mutate({
      data: {
        uuid: conversationID,
        name: newName,
      },
      conversationID: conversationID,
    });
    setIsNameDialogOpen(false);
  }, [updateChat, conversationID, newName]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsNameDialogOpen(open);
      if (!open) {
        setNewName(name);
      }
    },
    [name]
  );

  return (
    <div className="flex self-center space-x-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <DotsHorizontalIcon className="hover:stroke-primary self-center transition" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[150px]">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handlePinToggle} className="gap-2 items-center">
              {is_pinned ? (
                <>
                  <PinOff className="size-3" /> Unpin
                </>
              ) : (
                <>
                  <Pin className="size-3" /> Pin
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setIsNameDialogOpen(true)}
              className="gap-2 items-center"
            >
              <Pen className="size-3" /> Rename
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => deleteChat.mutate({ conversationID: conversationID })}
            className="flex gap-2 items-center group focus:bg-destructive"
          >
            <Trash className="size-3.5 group-hover:stroke-destructive-foreground text-destructive" />
            <span className="group-hover:text-destructive-foreground text-destructive">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isNameDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                placeholder={name}
                onChange={e => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeName}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
