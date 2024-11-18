import React from 'react';
import { Copy } from 'lucide-react';
import { useClipboard } from '@/hooks/use-clipboard.ts';
import { toast } from 'sonner';

interface CopyButtonProps {
  content: string;
}

export const CopyButton: React.FC<{ content: string }> = ({ content }: CopyButtonProps) => {
  const { copy } = useClipboard();

  const handleClick = (e: React.MouseEvent) => {
    copy(content);
    toast.success('Copied to clipboard!', {
      duration: 1500,
    });
  };

  return (
    <div className="relative inline-block">
      <Copy
        className="size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer"
        onClick={handleClick}
      />
    </div>
  );
};