import { Origami } from 'lucide-react';
import { PulseLoader } from 'react-spinners';

interface TypingIndicatorProps {
  isTyping: boolean;
  model: string;
}

export function TypingIndicator({ isTyping, model }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className="flex items-start mb-4">
      <div className="bg-primary/10 backdrop-blur p-2 rounded-lg max-w-[80%]">
        <div className="flex gap-2 items-center text-sm">
          <Origami className="size-4" strokeWidth="1" /> {model} is typing{' '}
          <PulseLoader
            size="3"
            speedMultiplier={0.75}
            color="#ffffff"
            className="stroke-primary-foreground"
          />
        </div>
      </div>
    </div>
  );
}