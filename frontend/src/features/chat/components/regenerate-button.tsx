import React, { useState } from 'react';
import { Sparkles, Sparkle } from 'lucide-react';
import { useClipboard } from '@/hooks/use-clipboard.ts';

interface RegenerateButtonProps {
  content: string;
}

export const RegenerateButton: React.FC<{ content: string }> = ({
  content,
}: RegenerateButtonProps) => {
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
          <Sparkle className="stroke-yellow-200 animate-in spin-in-180 size-3 hover:stroke-foreground" />
        ) : (
          <Sparkles
            className="animate-in spin-in-45 size-3 stroke-muted-foreground hover:stroke-yellow-400 hover:cursor-pointer"
            onClick={handleClick}
          />
        )}
      </div>
      <div className="absolute top-0 left-0 overflow-hidden h-12 w-12 pointer-events-none z-[1000]"></div>
    </div>
  );
};
