import { useMemo } from 'react';
import { Command, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Database, ArrowRight } from 'lucide-react';
import { Knowledge } from '@/features/knowledge/knowledge';
import { useKnowledgeList } from '@/features/knowledge/api';

interface KnowledgeSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (knowledge: Knowledge) => void;
  searchTerm: string;
  selectedIndex: number;
}

export const KnowledgeSuggestions = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  searchTerm,
  selectedIndex 
}: KnowledgeSuggestionsProps) => {
  const { data, isLoading } = useKnowledgeList();
  
  // Ensure we have an array of knowledge items
  const knowledgeItems = useMemo(() => Array.isArray(data?.data) ? data.data : [], [data?.data]);

  // Filter knowledge items based on search term
  const filteredKnowledge = useMemo(() => {
    if (!isOpen) return []; // Early return if not open to avoid unnecessary computation
    
    return knowledgeItems.filter(knowledge => 
      knowledge.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      knowledge.identifier.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [knowledgeItems, searchTerm, isOpen]);
  
  if (!isOpen) return null;

  return (
    <div className="right-0 bottom-full left-0 z-50 absolute mx-auto mb-2 md:max-w-lg lg:max-w-xl xl:max-w-3xl 2xl:max-w-4xl">
      <Command 
        className="bg-background/95 shadow-lg backdrop-blur-md border rounded-lg w-full overflow-hidden"
        shouldFilter={false}
      >
        <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 border-b">
          <Database className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-muted-foreground text-xs">
            Knowledge Sources
          </span>
        </div>

        <CommandList className="py-1 max-h-[280px] overflow-y-auto">
          {isLoading ? (
            <CommandEmpty className="py-4 text-muted-foreground text-sm text-center">
              Loading knowledge sources...
            </CommandEmpty>
          ) : filteredKnowledge.length === 0 ? (
            <CommandEmpty className="py-4 text-muted-foreground text-sm text-center">
              No knowledge sources found.
            </CommandEmpty>
          ) : (
            filteredKnowledge.map((knowledge: Knowledge, index: number) => (
              <CommandItem
                key={knowledge.id}
                value={knowledge.name}
                onSelect={() => onSelect(knowledge)}
                className={`relative flex items-center gap-3 mx-1 px-2 py-2 rounded-md transition-colors cursor-pointer group
                  ${index === selectedIndex ? 'bg-accent/60' : 'hover:bg-accent/60'}`}
              >
                <div className="flex justify-center items-center bg-background shadow-xs border rounded-md w-8 h-8 shrink-0">
                  <Database className="w-4 h-4 text-foreground/70" />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-sm truncate">
                    {knowledge.name}
                  </span>
                  <span className="text-muted-foreground text-xs truncate">
                    @{knowledge.identifier || knowledge.name.toLowerCase().replace(/\s+/g, '-')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <kbd className="hidden group-hover:inline-flex items-center gap-1 bg-muted px-1.5 border rounded h-5 font-medium text-[10px] text-muted-foreground">
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