import React from 'react';
import { Copy } from 'lucide-react';
import { useClipboard } from '@/hooks/use-clipboard.ts';
import { useToast } from '@/hooks/use-toast.ts';

interface CopyButtonProps {
  content: string;
}

export const CopyButton: React.FC<{ content: string }> = ({ content }: CopyButtonProps) => {
  const { copy } = useClipboard();
  const { toast } = useToast();

  const handleClick = () => {
    copy(content);
    toast({
      title: 'Successfully copied to clipboard',
      description: 'You can now paste the message in your desired location',
      duration: 5000,
      variant: 'success',
    });
  };

  return (
    <div className="inline-block relative">
      <Copy
        className="hover:cursor-pointer hover:stroke-foreground size-3 stroke-muted-foreground"
        onClick={handleClick}
      />
    </div>
  );
};
