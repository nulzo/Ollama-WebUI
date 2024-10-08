import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useClipboard } from '@/hooks/use-clipboard.ts';

interface CopyButtonProps {
  content: string;
}

export const CopyButton: React.FC<{ content: string }> = ({ content }: CopyButtonProps) => {
  const { copy } = useClipboard();
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    copy(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  return (
    <div className="relative inline-block">
      <div>
        {isCopied ? (
          <Check className="stroke-green-200 animate-spin animate-once animate-duration-500 animate-delay-100 animate-ease-in-out size-3 hover:stroke-foreground" />
        ) : (
          <Copy
            className="size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer"
            onClick={handleClick}
          />
        )}
      </div>
    </div>
  );
};
