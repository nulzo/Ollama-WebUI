import React, { useState } from 'react';
import { Sparkles, Sparkle } from 'lucide-react';
import { useClipboard } from '@/hooks/use-clipboard.ts';

interface EnhanceButtonProps {
  content: string;
}

export const EnhanceButton: React.FC<{ content: string }> = ({ content }: EnhanceButtonProps) => {
  const { copy } = useClipboard();
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
          <Sparkles className="stroke-yellow-100 animate-pulse size-3" />
        ) : (
          <Sparkles
            className="animate-in size-3 stroke-muted-foreground hover:stroke-yellow-400 hover:cursor-pointer"
            onClick={handleClick}
          />
        )}
      </div>
      <div className="absolute top-0 left-0 overflow-hidden h-12 w-12 pointer-events-none z-[1000]"></div>
    </div>
  );
};
