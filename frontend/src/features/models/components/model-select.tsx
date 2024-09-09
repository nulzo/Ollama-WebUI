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
} from '@/components/ui/command.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Spinner } from '@/components/ui/spinner';
import { OllamaModel } from '@/types/models';
import { useModels } from '@/features/models/api/get-models.ts';
import { OllamaModelData } from '@/features/models/types/models';

export const ModelSelect = () => {
  const [open, setOpen] = useState(false);
  const models = useModels({});

  const { setModel, model } = useModelStore(state => ({
    setModel: state.setModel,
    model: state.model,
  }));

  console.log(models);

  if (models.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleModelSelect = (model: OllamaModel) => {
    setModel(model);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[150px] justify-between border-0 bg-accent/0 font-semibold"
        >
          {model ? models?.data?.models?.find((m: OllamaModelData) => m.name === model.name)?.name : 'Select model...'}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models?.data?.models?.map((m: OllamaModel) => (
                <CommandItem key={m.name} value={m.name} onSelect={() => handleModelSelect(m)}>
                  {m.name}
                  <CheckIcon className={cn('ml-auto h-4 w-4', model?.name === m.name ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
