interface TypingIndicatorProps {
  isTyping: boolean;
  model: string;
}

export function TypingIndicator({ isTyping, model }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className="py-3 flex gap-2">
      <span className='text-xs font-light text-muted-foreground'>{model} is replying</span>
      <span className="flex space-x-1 justify-center items-center">
        <div className='h-[1px] w-[1px] bg-muted-foreground rounded-full animate-ping [animation-delay:-0.3s]'></div>
        <div className='h-[1px] w-[1px] bg-muted-foreground rounded-full animate-ping [animation-delay:-0.15s]'></div>
        <div className='h-[1px] w-[1px] bg-muted-foreground rounded-full animate-ping'></div>
      </span>
    </div>
  );
}