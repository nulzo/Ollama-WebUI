import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Knowledge } from '@/features/knowledge/knowledge';
import { useKnowledgeList } from '@/features/knowledge/api';

interface KnowledgeChipsProps {
  selectedKnowledgeIds: string[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const KnowledgeChips = memo(({ 
  selectedKnowledgeIds, 
  onRemove,
  disabled = false
}: KnowledgeChipsProps) => {
  const { data: knowledgeList } = useKnowledgeList();
  
  if (!selectedKnowledgeIds.length) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mt-1 mb-2">
      {selectedKnowledgeIds.map((id) => {
        const knowledge = knowledgeList?.data?.find((k) => k.id === id);
        if (!knowledge) return null;
        
        return (
          <div 
            key={id}
            className="flex items-center gap-0.5 bg-primary/10 px-2 py-0 rounded h-6 font-semibold text-primary text-xs select-none"
          >
            {knowledge.name}
            {!disabled && (
              <X
                className="ml-0.5 size-3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(id);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}); 