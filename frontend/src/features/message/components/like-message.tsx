import React, { useState } from 'react';
import { Sparkles, Sparkle, Heart } from 'lucide-react';
import { useClipboard } from '@/hooks/use-clipboard.ts';

interface LikeButtonProps {
  content: string;
}

export const LikeButton: React.FC<{ content: string }> = ({ content }: LikeButtonProps) => {
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
          <Heart className="animate-in spin-in-180 stroke-red-200 size-3" />
        ) : (
          <Heart
            className="animate-in size-3 stroke-muted-foreground hover:stroke-red-400 hover:cursor-pointer"
            onClick={handleClick}
          />
        )}
      </div>
      <div className="absolute top-0 left-0 overflow-hidden h-12 w-12 pointer-events-none z-[1000]"></div>
    </div>
  );
};
