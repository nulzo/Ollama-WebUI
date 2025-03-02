import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Database, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Knowledge } from '../knowledge';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface KnowledgeCardProps {
  knowledge: Knowledge;
  onEdit: (knowledge: Knowledge) => void;
  onDelete: () => void;
  onView: () => void;
}

export const KnowledgeCard = ({ knowledge, onEdit, onDelete, onView }: KnowledgeCardProps) => {
  const createdAt = new Date(knowledge.created_at);
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });

  return (
    <motion.div
      className="relative flex flex-col bg-secondary p-6 rounded-lg h-full transition-shadow duration-300"
      whileHover={{ scale: 1.0 }}
    >
      {/* Menu button in top-right corner */}
      <div className="top-4 right-4 absolute">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 w-8 h-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView()}>View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(knowledge)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex justify-center items-center bg-primary/10 rounded-md w-8 h-8">
            <Database className="size-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-xl truncate">{knowledge.name}</h2>
            <div className="font-medium text-muted-foreground text-xs">{timeAgo}</div>
          </div>
        </div>
        <p className="mb-4 text-muted-foreground text-sm line-clamp-2">
          {knowledge.content.length > 100
            ? `${knowledge.content.substring(0, 100)}...`
            : knowledge.content}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            <FileText className="mr-1 size-3" />
            Knowledge
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}; 