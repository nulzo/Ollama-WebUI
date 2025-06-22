import { useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog.tsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { ProviderIcon } from '@/features/models/components/model-select';

interface BotIconProps {
  isOnline?: boolean;
  modelName?: string;
  provider?: string;
}

export const BotIcon = ({ isOnline, modelName, provider }: BotIconProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <div className="relative flex justify-center items-center bg-background border border-border rounded-lg w-10 h-10 cursor-pointer p-2">
                {provider ? (
                  <ProviderIcon provider={provider} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-md bg-muted/50">
                    <span className="text-sm font-semibold text-muted-foreground">?</span>
                  </div>
                )}
                <div
                  className={`absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-background
                  ${isOnline ? 'bg-green-500' : 'bg-background border border-foreground/75'}`}
                />
              </div>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {modelName} is {isOnline ? 'online' : 'offline'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Dialog>
  );
};
