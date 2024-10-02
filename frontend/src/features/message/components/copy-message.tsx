import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useClipboard } from '@/hooks/use-clipboard.ts';
import { useConfetti } from '@/hooks/use-confetti.ts';

interface CopyButtonProps {
  content: string;
}

export const CopyButton: React.FC<{ content: string }> = ({ content }: CopyButtonProps) => {
  const { copy } = useClipboard();
  const { showConfetti, ref } = useConfetti();
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    copy(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 750);
  };

  return (
    <div className="relative inline-block">
      <div>
        {isCopied ? (
          <Check className="stroke-green-200 animate-in spin-in-180 size-3 hover:stroke-foreground" />
        ) : (
          <Copy
            className="animate-in spin-in-45 size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer"
            onClick={handleClick}
          />
        )}
      </div>
      <div
        ref={ref}
        className="absolute top-0 left-0 overflow-hidden h-12 w-12 pointer-events-none z-[1000]"
      ></div>
    </div>
  );
};
