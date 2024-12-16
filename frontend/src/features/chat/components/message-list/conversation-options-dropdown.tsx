import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useDeleteConversation } from '../../api/delete-conversation.ts';
import { Pen, Pin, PinOff, SquareMenu, Trash } from 'lucide-react';
import { useUpdateConversation } from '../../api/update-conversation.ts';

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
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Label } from '@/components/ui/label.tsx';

export const ConversationOptionsDropdown = ({
  conversationID,
  is_pinned,
  name,
}: ConversationOptionsDropdownProps) => {
  const deleteChat = useDeleteConversation();
  const updateChat = useUpdateConversation();
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isSummarizeDialogOpen, setIsSummarizeDialogOpen] = useState(false);
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

  const handleSummarizeOpenChange = useCallback((open: boolean) => {
    setIsSummarizeDialogOpen(open);
  }, []);

  const handleSummarize = () => {
    setIsSummarizeDialogOpen(false);
  };

  return (
    <div className="flex space-x-1 self-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <DotsHorizontalIcon className="hover:stroke-primary transition self-center" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[150px]" align="center" sideOffset={2} side="right">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handlePinToggle} className="items-center gap-2">
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
              className="items-center gap-2"
            >
              <Pen className="size-3" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setIsSummarizeDialogOpen(true)}
              className="items-center gap-2"
            >
              <SquareMenu className="size-3" /> Summarize
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => deleteChat.mutate({ conversationID: conversationID })}
            className="flex items-center gap-2 focus:bg-destructive group"
          >
            <Trash className="group-hover:stroke-destructive-foreground text-destructive size-3.5" />
            <span className="group-hover:text-destructive-foreground text-destructive">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isNameDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="gap-4 grid py-4">
            <div className="items-center gap-4 grid grid-cols-4">
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

      <Dialog open={isSummarizeDialogOpen} onOpenChange={handleSummarizeOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Summarize Chat</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 py-4">
              <div className="flex flex-col bg-muted/25 border rounded-md w-full h-72">
                <p className="m-auto text-muted-foreground text-sm">
                  Please press the{' '}
                  <code className="border-primary/25 bg-primary/5 m-1 p-1 border rounded-lg text-primary">
                    Summarize
                  </code>{' '}
                  button to generate a summary ...
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleSummarizeOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleSummarize}>Summarize</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
