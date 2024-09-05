import { Origami } from 'lucide-react';

export const BotIcon = () => {
  return (
    <div className="relative p-2 bg-primary rounded-lg mt-1">
      <Origami strokeWidth="1.5" className="size-5 text-primary-foreground" />
      <div className="absolute -right-0.5 -bottom-0.5 rounded-full h-2.5 w-2.5 bg-green-400" />
    </div>
  );
};
