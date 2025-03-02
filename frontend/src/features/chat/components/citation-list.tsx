import React from 'react';
import { Book, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Message } from '../types/message';
import { useSettings } from '@/features/settings/api/get-settings';

interface CitationListProps {
  message: Message;
}

export const CitationList: React.FC<CitationListProps> = ({ message }) => {
  const { data: settingsData } = useSettings();
  const inlineCitationsEnabled = settingsData?.settings?.general?.inline_citations_enabled ?? true;
  
  if (!message.has_citations || !message.citations || message.citations.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 pt-2 border-t border-border">
      <div className="flex items-center gap-1 mb-1 text-muted-foreground text-xs">
        <Info size={12} />
        <span>{inlineCitationsEnabled ? 'Sources:' : 'Sources:'}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {message.citations.map((citation, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 h-7 text-xs"
                  onClick={() => {
                    // You can implement navigation to the knowledge document here
                    console.log('Navigate to knowledge document', citation.knowledge_id);
                  }}
                >
                  <FileText size={12} />
                  <span className="max-w-[200px] truncate">
                    {inlineCitationsEnabled ? `[${index + 1}] ${citation.text}` : citation.text}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">
                <div className="text-xs">
                  <div className="font-semibold">{citation.text}</div>
                  {citation.metadata?.source && (
                    <div>Source: {citation.metadata.source}</div>
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
        ))}
      </div>
    </div>
  );
}; 