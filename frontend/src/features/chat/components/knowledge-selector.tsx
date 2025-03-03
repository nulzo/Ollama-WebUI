import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, X, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useKnowledgeList } from '@/features/knowledge/api';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Knowledge } from '@/features/knowledge/knowledge';

interface KnowledgeSelectorProps {
  selectedKnowledgeIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function KnowledgeSelector({ selectedKnowledgeIds, onSelectionChange }: KnowledgeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: knowledgeList } = useKnowledgeList();
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedKnowledgeIds);

  useEffect(() => {
    setSelectedIds(selectedKnowledgeIds);
  }, [selectedKnowledgeIds]);

  const filteredKnowledge = knowledgeList?.data?.filter(
    (knowledge) => knowledge.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleToggleKnowledge = (knowledge: Knowledge) => {
    const newSelectedIds = selectedIds.includes(knowledge.id)
      ? selectedIds.filter(id => id !== knowledge.id)
      : [...selectedIds, knowledge.id];
    
    setSelectedIds(newSelectedIds);
    onSelectionChange(newSelectedIds);
  };

  const handleClearAll = () => {
    setSelectedIds([]);
    onSelectionChange([]);
  };

  const selectedCount = selectedIds.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 px-2 h-7 w-7 text-xs bg-transparent hover:bg-transparent shadow-none hover:text-foreground text-muted-foreground ${selectedCount > 0 ? 'text-primary' : ''}`}
        >
          <Database className="size-4" />
          <span className="sr-only">
            {selectedCount > 0 ? `${selectedCount} Knowledge Source${selectedCount > 1 ? 's' : ''}` : 'Knowledge'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80" align="end">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Knowledge Sources</h4>
            {selectedCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll} className="px-2 h-8 text-xs">
                Clear all
              </Button>
            )}
          </div>
          <Input
            placeholder="Search knowledge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        
        <ScrollArea className="max-h-[300px] overflow-auto">
          {filteredKnowledge.length > 0 ? (
            <div className="p-2">
              {filteredKnowledge.map((knowledge) => {
                const isSelected = selectedIds.includes(knowledge.id);
                return (
                  <div
                    key={knowledge.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-secondary ${
                      isSelected ? 'bg-secondary' : ''
                    }`}
                    onClick={() => handleToggleKnowledge(knowledge)}
                  >
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="flex justify-center items-center bg-primary rounded-full w-5 h-5">
                            <Check className="size-3 text-white" />
                          </div>
                        ) : (
                          <div className="border border-muted-foreground rounded-full w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{knowledge.name}</p>
                        <p className="text-muted-foreground text-xs truncate">
                          {knowledge.content.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-muted-foreground text-center">
              {searchTerm ? 'No matching knowledge found' : 'No knowledge available'}
            </div>
          )}
        </ScrollArea>
        
        {selectedCount > 0 && (
          <div className="p-4 border-t">
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id) => {
                const knowledge = knowledgeList?.data?.find((k) => k.id === id);
                if (!knowledge) return null;
                return (
                  <Badge key={id} variant="secondary" className="gap-1">
                    {knowledge.name}
                    <X
                      className="size-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleKnowledge(knowledge);
                      }}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
} 