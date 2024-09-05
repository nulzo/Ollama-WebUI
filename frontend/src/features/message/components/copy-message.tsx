import React from 'react';
import { Copy } from 'lucide-react';
import { useClipboard } from '@/hooks/use-clipboard.ts';
import { useConfetti } from '@/hooks/use-confetti.ts';

interface CopyButtonProps {
  content: string;
}

export const CopyButton: React.FC<{ content: string }> = ({ content }: CopyButtonProps) => {
  const { copy } = useClipboard();
  const { showConfetti, ref } = useConfetti();

  const handleClick = (e: React.MouseEvent) => {
    copy(content);
    const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
    if (buttonRect) {
      const offsetX = e.clientX - buttonRect.left;
      const offsetY = e.clientY - buttonRect.top;
      const centerX = buttonRect.width / 2;
      const centerY = buttonRect.height / 2;
      showConfetti(centerX, centerY, offsetX, offsetY);
    }
  };

  return (
    <div className="relative inline-block">
      <Copy
        className="size-3 stroke-muted-foreground hover:stroke-foreground hover:cursor-pointer"
        onClick={handleClick}
      />
      <div ref={ref} className="absolute top-0 left-0 w-48 h-48 pointer-events-none"></div>
    </div>
  );
};
