import { useMemo } from 'react';
import { Command, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Command as CommandIcon, ArrowRight } from 'lucide-react';
import { Prompt } from '@/features/prompts/prompt';
import { usePrompts } from '@/features/prompts/api/get-prompts';

interface PromptSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (prompt: Prompt) => void;
  searchTerm: string;
  selectedIndex: number;
}

export const PromptSuggestions = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  searchTerm,
  selectedIndex 
}: PromptSuggestionsProps) => {
  const { data, isLoading } = usePrompts();
  
  // Ensure we have an array of prompts - moved outside conditional return
  const prompts = useMemo(() => Array.isArray(data?.data) ? data.data : [], [data?.data]);

  // Filter prompts based on search term - moved outside conditional return
  const filteredPrompts = useMemo(() => {
    if (!isOpen) return []; // Early return if not open to avoid unnecessary computation
    
    return prompts.filter(prompt => 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (prompt.command || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [prompts, searchTerm, isOpen]);
  
  if (!isOpen) return null;

  return (
    <div className="right-0 bottom-full left-0 z-50 absolute mx-auto mb-2 md:max-w-lg lg:max-w-xl xl:max-w-3xl 2xl:max-w-4xl">
      <Command 
        className="bg-background/95 shadow-lg backdrop-blur-md border rounded-lg w-full overflow-hidden"
        shouldFilter={false}
      >
        <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 border-b">
          <CommandIcon className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-muted-foreground text-xs">
            Quick Commands
          </span>
        </div>

        <CommandList className="py-1 max-h-[280px] overflow-y-auto">
          {isLoading ? (
            <CommandEmpty className="py-4 text-center text-muted-foreground text-sm">
              Loading commands...
            </CommandEmpty>
          ) : filteredPrompts.length === 0 ? (
            <CommandEmpty className="py-4 text-center text-muted-foreground text-sm">
              No commands found.
            </CommandEmpty>
          ) : (
            filteredPrompts.map((prompt: Prompt, index: number) => (
              <CommandItem
                key={prompt.id}
                value={prompt.command || prompt.title}
                onSelect={() => onSelect(prompt)}
                className={`relative flex items-center gap-3 mx-1 px-2 py-2 rounded-md transition-colors cursor-pointer group
                  ${index === selectedIndex ? 'bg-accent/60' : 'hover:bg-accent/60'}`}
              >
                <div className="flex justify-center items-center bg-background shadow-xs border rounded-md w-8 h-8 shrink-0">
                  <CommandIcon className="w-4 h-4 text-foreground/70" />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-sm truncate">
                    {prompt.title}
                  </span>
                  <span className="text-muted-foreground text-xs truncate">
                    /{prompt.command || prompt.title.toLowerCase().replace(/\s+/g, '-')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <kbd className="group-hover:inline-flex items-center gap-1 hidden bg-muted px-1.5 border rounded h-5 font-medium text-[10px] text-muted-foreground">
                    <span className="text-xs">⏎</span>
                  </kbd>
                  <ArrowRight className="opacity-0 group-hover:opacity-100 w-4 h-4 text-muted-foreground transition-opacity" />
                </div>
              </CommandItem>
            ))
          )}
        </CommandList>
      </Command>
    </div>
  );
};