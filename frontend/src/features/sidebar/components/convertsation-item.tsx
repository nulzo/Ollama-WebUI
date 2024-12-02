import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, MoreVertical, Trash, Edit, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteConversation } from '@/features/conversation/api/delete-conversation';
// import { useCloneConversation } from '@/features/conversation/api/clone-conversation';
import { Conversation } from '@/features/conversation/types/conversation';

interface ConversationItemProps {
  conversation: Conversation;
  isCollapsed: boolean;
}

export const ConversationItem = ({ conversation, isCollapsed }: ConversationItemProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.name);

  const deleteConversation = useDeleteConversation();
  //   const cloneConversation = useCloneConversation();

  const handleNavigate = () => {
    navigate(`/chat/${conversation.uuid}`);
  };

  const handleDelete = async () => {
    await deleteConversation.mutateAsync({ conversationID: conversation.uuid });
  };

  //   const handleClone = async () => {
  //     await cloneConversation.mutateAsync(conversation.uuid);
  //   };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your update conversation title mutation here
    setIsEditing(false);
  };

  return (
    <div className="group relative">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'relative flex justify-start items-center w-full h-8 text-sm group',
          conversation && 'bg-accent'
        )}
        onClick={handleNavigate}
      >
        <div className="left-2 absolute flex items-center">
          <MessageSquare className="size-4" />
          {!isCollapsed && (
            <motion.div
              className="ml-2 flex-1 truncate"
              initial={false}
              animate={{
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : 'auto',
              }}
              transition={{
                duration: 0.2,
                ease: 'easeInOut',
              }}
            >
              {isEditing ? (
                <form onSubmit={handleTitleSubmit}>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full bg-transparent border-none focus:outline-none"
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                  />
                </form>
              ) : (
                <span className="truncate">{conversation.name}</span>
              )}
            </motion.div>
          )}
        </div>

        {!isCollapsed && (
          <motion.div
            className="absolute right-2 opacity-0 group-hover:opacity-100"
            animate={{
              opacity: isCollapsed ? 0 : undefined,
            }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut',
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={e => e.stopPropagation()}
                >
                  <MoreVertical className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 size-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 size-4" />
                  Clone
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </Button>
    </div>
  );
};
