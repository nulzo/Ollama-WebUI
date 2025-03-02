import { Knowledge } from '../knowledge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface KnowledgeViewerProps {
  knowledge: Knowledge;
}

export const KnowledgeViewer = ({ knowledge }: KnowledgeViewerProps) => {
  const createdAt = new Date(knowledge.created_at);
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-bold text-2xl">{knowledge.name}</h2>
        <div className="text-muted-foreground text-sm">
          Created {timeAgo} • ID: {knowledge.identifier}
        </div>
      </div>

      <ScrollArea className="p-4 border rounded-md h-[400px]">
        <div className="whitespace-pre-wrap">{knowledge.content}</div>
      </ScrollArea>
    </div>
  );
}; 