import React from 'react';
import { FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Citation } from '@/types/chat';

interface InlineCitationProps {
  citationId: string;
  citationIndex: number;
  citations: Citation[];
}

const InlineCitation: React.FC<InlineCitationProps> = ({ citationId, citationIndex, citations }) => {
  // Find the citation by ID
  const citation = citations.find(c => c.chunk_id === citationId);
  
  if (!citation) {
    return <sup>[{citationIndex}]</sup>;
  }
  
  // Clean up citation text before displaying
  let displayText = citation.text || '';
  
  // Remove Unicode null characters
  displayText = displayText.replace(/\u0000/g, '');
  
  // If the text is empty or just whitespace, use a fallback
  if (!displayText.trim()) {
    displayText = citation.metadata?.source || 
                 citation.metadata?.citation || 
                 `Source ${citationIndex}`;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <sup 
            className="font-medium text-primary hover:text-primary/80 cursor-pointer"
            data-citation-id={citationId}
          >
            [{citationIndex}]
          </sup>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-sm">
          <div className="text-xs">
            <div className="flex items-center gap-1 font-semibold">
              <FileText size={12} />
              <span>{displayText}</span>
            </div>
            {citation.metadata?.source && (
              <div className="mt-1">Source: {citation.metadata.source}</div>
            )}
            {citation.metadata?.page && (
              <div>Page: {citation.metadata.page}</div>
            )}
            {citation.metadata?.row && (
              <div>Row: {citation.metadata.row}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InlineCitation; 