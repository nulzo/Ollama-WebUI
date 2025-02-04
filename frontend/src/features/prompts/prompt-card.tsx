import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Prompt } from './prompt';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: () => void;
}

export const PromptCard = ({ prompt, onEdit, onDelete }: PromptCardProps) => (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-secondary rounded-lg p-6 relative"
  >
    {/* Menu button in top-right corner */}
    <div className="absolute top-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(prompt)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Card content container */}
    <div className="flex-1">
      {/* Prompt info section */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold whitespace-nowrap truncate">{prompt.title}</h2>
          <div className="w-full text-xs font-bold text-muted-foreground">
            /{prompt.command || prompt.title.toLowerCase().replace(/\s+/g, '-')}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground truncate mb-4">
        {prompt.description || 'No description provided'}
      </p>

      {/* Preview of the prompt content */}
      <div className="bg-background/50 rounded-md p-3 mb-4">
        <p className="text-sm font-mono text-muted-foreground line-clamp-3">{prompt.content}</p>
      </div>

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {prompt.tags.map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);
