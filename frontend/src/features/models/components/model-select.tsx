import { useState } from 'react';
import { useModelStore } from '../store/model-store';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Spinner } from '@/components/ui/spinner';
import { OllamaModel } from '@/types/models';
import { useModels } from '@/features/models/api/get-models.ts';
import { OllamaModelData } from '@/features/models/types/models';
import { Heart } from 'lucide-react';
import { Tooltip } from '@radix-ui/react-tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAssistants } from '@/features/assistant/hooks/use-assistant';
import { Assistant } from '@/features/assistant/types/assistant';

export const ModelSelect = () => {
  const [open, setOpen] = useState(false);
  const ollamaModels = useModels({});
  const { assistants, isLoading: isLoadingAssistants } = useAssistants();

  const { setModel, model } = useModelStore(state => ({
    setModel: state.setModel,
    model: state.model,
  }));

  if (ollamaModels.isLoading || isLoadingAssistants) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleModelSelect = (selectedModel: OllamaModel | Assistant) => {
    setModel(selectedModel);
  };

  const truncateModelName = (name: string) => {
    return name.endsWith(':latest') ? name.slice(0, -7) : name;
  };

  const userAssistants = assistants || [];
  const availableOllamaModels =
    ollamaModels.data?.models?.filter(
      (m: OllamaModelData) => !userAssistants.some(assistant => assistant.name === m.name)
    ) || [];

  return (
    <div className="relative flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className="flex gap-1 text-sm font-semibold w-fit max-w-sm justify-start border-0 select-none"
          >
            {model ? truncateModelName(model.name) : 'Select model...'}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-fit max-w-sm p-0" align="start">
          <Command>
            <CommandInput placeholder="Search model..." className="h-9" />
            <CommandList>
              <CommandEmpty>No model found...</CommandEmpty>
              {userAssistants.length > 0 && (
                <CommandGroup heading="User Assistants">
                  {userAssistants.map(assistant => (
                    <CommandItem
                      key={assistant.id}
                      className="min-w-[250px] max-w-[250px] w-[250px] whitespace-nowrap truncate"
                      value={assistant.name}
                      onSelect={() => handleModelSelect(assistant)}
                    >
                      <span className="truncate">{truncateModelName(assistant.name)}</span>
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          model?.name === assistant.name ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {userAssistants.length > 0 && availableOllamaModels.length > 0 && (
                <CommandSeparator />
              )}
              {availableOllamaModels.length > 0 && (
                <CommandGroup heading="Available Ollama Models">
                  {availableOllamaModels.map((m: OllamaModel) => (
                    <CommandItem
                      key={m.name}
                      className="min-w-[250px] max-w-[250px] w-[250px] whitespace-nowrap truncate"
                      value={m.name}
                      onSelect={() => handleModelSelect(m)}
                    >
                      <span className="truncate">{truncateModelName(m.name)}</span>
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          model?.name === m.name ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {model && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="text-xs font-normal text-muted-foreground"
                variant="link"
                size="icon"
              >
                <Heart className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={3} className="bg-accent">
              Set as default model
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
