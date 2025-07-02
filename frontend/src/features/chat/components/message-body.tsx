import { memo, useMemo } from 'react';
import MarkdownRenderer from '@/features/markdown/components/markdown';
import { AsyncMessageImage } from './async-image';
import { CitationList } from './citation-list';
import { ToolCallList } from './tool-call-list';
import { Skeleton } from '@/components/ui/skeleton';
import { Message } from '../types/message';
import { useSettings } from '@/features/settings/api/get-settings';
import { addInlineCitations } from '../utils/process-citations';

interface MessageBodyProps {
  message: Message;
  isTyping: boolean;
  isCancelled: boolean;
}

export const MessageBody = memo(({ message, isTyping, isCancelled }: MessageBodyProps) => {
  const { data: settingsData } = useSettings();
  const inlineCitationsEnabled = settingsData?.settings?.general?.inline_citations_enabled ?? true;
  const messageContent = message.content || '';

  const displayContent = useMemo(() => {
    let content = messageContent;
    if (isCancelled && typeof content === 'string' && content.endsWith('[cancelled]')) {
      content = content.replace('[cancelled]', '');
    }

    if (typeof content === 'string') {
      content = content.replace(/\u0000/g, '');
      content = content.replace(/e:$/g, '');
    }

    if (inlineCitationsEnabled && message.has_citations && message.citations && message.citations.length > 0) {
      content = addInlineCitations(content, message.citations);
    }
    
    return content;
  }, [messageContent, isCancelled, message.has_citations, message.citations, inlineCitationsEnabled]);

  return (
    <>
      {message.image_ids?.length && message.image_ids.length > 0 && (
        <div className={`flex flex-wrap gap-2 mb-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
          <AsyncMessageImage
            imageId={message.image_ids[0] as number}
            images={message.image_ids as number[]}
            currentIndex={0}
          />
        </div>
      )}

      <div className={`p-2 rounded-xl rounded-tl ${isCancelled ? 'bg-muted/30' : ''} ${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
        <div className={`max-w-none prose prose-sm scroll-smooth ${isCancelled ? 'text-muted-foreground/75' : ''} ${message.role === 'user' ? 'prose-invert' : ''}`}>
          {displayContent ? (
            <MarkdownRenderer markdown={displayContent} citations={message.citations} />
          ) : (
            <div className="h-6" />
          )}
          {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />}
        </div>

        {message.tool_calls && message.tool_calls.length > 0 && (
          <ToolCallList message={message} />
        )}

        {message.has_citations && <CitationList message={message} />}
      </div>
    </>
  );
}); 