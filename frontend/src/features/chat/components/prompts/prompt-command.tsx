import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Command, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Command as CommandIcon, ArrowRight } from 'lucide-react';
import { usePrompts } from '@/features/prompts/api/get-prompts';
import { Prompt } from '@/features/prompts/prompt';

interface PromptCommandProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
  searchTerm: string;
}

// Memoized CommandItem to prevent re-renders
const MemoizedCommandItem = memo(({ 
  prompt, 
  onSelect, 
  isSelected 
}: { 
  prompt: Prompt; 
  onSelect: () => void; 
  isSelected: boolean;
}) => (
  <CommandItem
    key={prompt.id}
    value={prompt.command || prompt.title}
    onSelect={onSelect}
    className={`relative flex items-center gap-3 mx-1 px-2 py-2 rounded-md transition-colors cursor-pointer group
      ${isSelected ? 'bg-accent/60' : 'hover:bg-accent/60'}`}
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
));

// Memoized CommandList to prevent re-renders
const MemoizedCommandList = memo(({
  isLoading,
  filteredPrompts,
  onSelectPrompt,
  selectedIndex
}: {
  isLoading: boolean;
  filteredPrompts: Prompt[];
  onSelectPrompt: (prompt: Prompt) => void;
  selectedIndex: number;
}) => (
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
        <MemoizedCommandItem
          key={prompt.id}
          prompt={prompt}
          onSelect={() => onSelectPrompt(prompt)}
          isSelected={index === selectedIndex}
        />
      ))
    )}
  </CommandList>
));

// Memoized Command Header to prevent re-renders
const CommandHeader = memo(() => (
  <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 border-b">
    <CommandIcon className="w-4 h-4 text-muted-foreground" />
    <span className="font-medium text-muted-foreground text-xs">
      Quick Commands
    </span>
  </div>
));

export const PromptCommand = memo(({ isOpen, onClose, onSelect, searchTerm }: PromptCommandProps) => {
  const { data: prompts, isLoading } = usePrompts();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selected index when search term changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  // Close prompt when search term is empty
  useEffect(() => {
    if (!searchTerm && isOpen) {
      onClose();
    }
  }, [searchTerm, isOpen, onClose]);

  // Memoize filtered prompts to prevent recalculation on every render
  const filteredPrompts = useMemo(() => {
    if (!isOpen || !prompts?.data) return [];
    
    return prompts.data.filter((prompt: Prompt) => 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (prompt.command || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [isOpen, prompts?.data, searchTerm]);

  // Memoize the handler to prevent recreation on every render
  const handleSelectPrompt = useCallback((prompt: Prompt) => {
    onSelect(prompt.content);
    onClose();
  }, [onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="right-0 bottom-full left-0 z-50 absolute mx-auto mb-2 md:max-w-lg lg:max-w-xl xl:max-w-3xl 2xl:max-w-4xl">
      <Command 
        className="bg-background/95 shadow-lg backdrop-blur-md border rounded-lg w-full overflow-hidden"
        shouldFilter={false}
      >
        <CommandHeader />
        <MemoizedCommandList
          isLoading={isLoading}
          filteredPrompts={filteredPrompts}
          onSelectPrompt={handleSelectPrompt}
          selectedIndex={selectedIndex}
        />
      </Command>
    </div>
  );
});