import { useState, useEffect } from 'react';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { useCustomPrompts, CustomPrompt } from '../../hooks/use-custom-prompts';
import { Command as CommandIcon } from 'lucide-react';

interface PromptCommandProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
  searchTerm: string;
}

export const PromptCommand = ({ isOpen, onClose, onSelect, searchTerm }: PromptCommandProps) => {
  const { prompts, isLoading } = useCustomPrompts();
  const [filtered, setFiltered] = useState<CustomPrompt[]>([]);

  useEffect(() => {
    if (!prompts) return;
    
    const term = searchTerm.toLowerCase().replace('/', '');
    setFiltered(
      prompts.filter((prompt) => 
        prompt.command.toLowerCase().includes(term) || 
        prompt.title.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, prompts]);

  if (!isOpen) return null;

  return (
    <Command className="bottom-24 left-1/2 fixed bg-background/95 shadow-lg backdrop-blur-md border rounded-xl w-[90%] max-w-[500px] -translate-x-1/2">
      <div className="flex items-center px-3 border-b h-11">
        <CommandIcon className="mr-2 w-4 h-4 text-muted-foreground shrink-0" />
        <CommandInput 
          placeholder="Search commands..." 
          value={searchTerm} 
          readOnly 
          className="flex border-0 bg-transparent disabled:opacity-50 py-3 rounded-md focus-visible:ring-0 w-full h-10 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed outline-hidden"
        />
      </div>
      <CommandList className="p-2 max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <CommandEmpty className="py-6 text-center text-muted-foreground text-sm">
            Loading commands...
          </CommandEmpty>
        ) : filtered.length === 0 ? (
          <CommandEmpty className="py-6 text-center text-muted-foreground text-sm">
            No commands found.
          </CommandEmpty>
        ) : (
          filtered.map((prompt) => (
            <CommandItem
              key={prompt.id}
              value={prompt.command}
              onSelect={() => {
                onSelect(prompt.content);
                onClose();
              }}
              className="relative flex items-center aria-selected:bg-accent/50 hover:bg-accent/50 px-3 py-2.5 rounded-sm cursor-pointer select-none group outline-hidden"
            >
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="font-medium truncate">{prompt.title}</span>
                <span className="text-muted-foreground text-xs truncate">/{prompt.command}</span>
              </div>
              <kbd className="group-hover:inline-block top-1/2 right-2 absolute hidden text-muted-foreground text-xs -translate-y-1/2 pointer-events-none">
                Enter
              </kbd>
            </CommandItem>
          ))
        )}
      </CommandList>
    </Command>
  );
};