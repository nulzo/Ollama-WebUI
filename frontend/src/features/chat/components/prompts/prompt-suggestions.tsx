import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Command as CommandIcon, ArrowRight } from 'lucide-react';
import { CustomPrompt } from '../../data/mock-prompts';

interface PromptSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (prompt: CustomPrompt) => void;
  searchTerm: string;
  prompts: CustomPrompt[];
  selectedIndex: number;
}

export const PromptSuggestions = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  searchTerm,
  prompts,
  selectedIndex 
}: PromptSuggestionsProps) => {
  if (!isOpen) return null;

  return (
    <div className="right-0 bottom-full left-0 z-50 absolute mx-auto mb-2 w-full w-full md:max-w-2xl lg:max-w-3xl xl:max-w-5xl 2xl:max-w-7xl">
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
          {prompts.length === 0 ? (
            <CommandEmpty className="py-4 text-center text-muted-foreground text-sm">
              No commands found.
            </CommandEmpty>
          ) : (
            prompts.map((prompt, index) => (
              <CommandItem
                key={prompt.id}
                value={prompt.command}
                onSelect={() => onSelect(prompt)}
                className={`relative flex items-center gap-3 mx-1 px-2 py-2 rounded-md transition-colors cursor-pointer group
                  ${index === selectedIndex ? 'bg-accent/60' : 'hover:bg-accent/60'}`}
              >
                <div className="flex justify-center items-center bg-background shadow-sm border rounded-md w-8 h-8 shrink-0">
                  <CommandIcon className="w-4 h-4 text-foreground/70" />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-sm truncate">
                    {prompt.title}
                  </span>
                  <span className="text-muted-foreground text-xs truncate">
                    /{prompt.command}
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