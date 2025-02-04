import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Prompt } from '@/features/prompts/prompt';

interface InlinePromptBadgeProps {
  prompt: Prompt;
}

export const InlinePromptBadge = ({ prompt }: InlinePromptBadgeProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="secondary"
          className="inline-flex hover:bg-secondary/80 mx-1 cursor-pointer align-middle"
        >
          {prompt.title}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">{prompt.title}</h4>
          <p className="text-muted-foreground text-sm">{prompt.content}</p>
          {prompt.description && (
            <p className="text-muted-foreground text-xs">{prompt.description}</p>
          )}
          <div className="text-xs text-muted-foreground font-mono">
            /{prompt.command || prompt.title.toLowerCase().replace(/\s+/g, '-')}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};