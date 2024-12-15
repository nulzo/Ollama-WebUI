import { AssistantCard } from '@/features/models/components/model-card';
import { Origami } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BotIconProps {
  assistantId: number;
  isOnline?: boolean;
  modelName?: string;
}

export const BotIcon = ({ assistantId, isOnline, modelName }: BotIconProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  const renderIcon = () => {
    return <Origami strokeWidth="1.5" className="m-2 text-primary-foreground size-6" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <div className="relative bg-primary rounded-lg cursor-pointer">
                {renderIcon()}
                <div
                  className={`absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-background
                  ${isOnline ? 'bg-green-500' : 'bg-background border border-muted'}`}
                />
              </div>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {modelName} is {isOnline ? 'online' : 'offline'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AssistantCard assistantId={assistantId} onClose={handleClose} />
    </Dialog>
  );
};
