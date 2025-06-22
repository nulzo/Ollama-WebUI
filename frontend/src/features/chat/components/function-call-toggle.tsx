import { memo } from 'react';
import { Code } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FunctionCallToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const FunctionCallToggle = memo(({ enabled, onToggle }: FunctionCallToggleProps) => {
  return (
    <div className="flex justify-end items-center mb-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-2 bg-secondary/30 hover:bg-secondary/40 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              onClick={() => onToggle(!enabled)}
            >
              <div
                className={`flex items-center justify-center w-5 h-5 rounded-full ${
                  enabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Code className="w-3 h-3" />
              </div>
              <span className="font-medium text-xs">{enabled ? 'Tools Enabled' : 'Tools Disabled'}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Enable AI to use your custom tools and functions</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});

FunctionCallToggle.displayName = 'FunctionCallToggle'; 