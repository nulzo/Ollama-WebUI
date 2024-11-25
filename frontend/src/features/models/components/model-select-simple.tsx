import { useCallback, useMemo, useState } from 'react';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useModels } from '@/features/models/api/get-models';
import { useOpenAiModels } from '@/features/models/api/get-openai-models';
import { OllamaModelData } from '@/features/models/types/models';

interface ModelSelectSimpleProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const ModelSelectSimple = ({ value, onValueChange }: ModelSelectSimpleProps) => {
  const [open, setOpen] = useState(false);
  const ollamaModels = useModels({});
  const openaiModels = useOpenAiModels({});

  const truncateModelName = useCallback((name: string) => {
    try {
      return name.endsWith(':latest') ? name.slice(0, -7) : name;
    } catch (error) {
      return name;
    }
  }, []);

  const { availableOllamaModels, openai } = useMemo(() => ({
    openai: openaiModels.data || [],
    availableOllamaModels: ollamaModels.data?.models || []
  }), [ollamaModels.data, openaiModels.data]);

  const handleSelect = useCallback((modelName: string) => {
    onValueChange(modelName);
    setOpen(false);
  }, [onValueChange]);

  if (ollamaModels.isLoading || openaiModels.isLoading) {
    return <Skeleton className="w-full h-10" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {value ? truncateModelName(value) : 'Select model...'}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-full p-0">
        <Command className="w-full">
          <CommandInput placeholder="Search model..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found...</CommandEmpty>
            {availableOllamaModels.length > 0 && (
              <CommandGroup heading="Ollama Models">
                {availableOllamaModels.map((m: OllamaModelData) => (
                  <CommandItem
                    key={m.name}
                    value={m.name}
                    onSelect={() => handleSelect(m.name)}
                  >
                    <span className="truncate">{truncateModelName(m.name)}</span>
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === m.name ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {availableOllamaModels.length > 0 && openai.length > 0 && (
              <CommandSeparator />
            )}
            {openai.length > 0 && (
              <CommandGroup heading="OpenAI Models">
                {openai.map((m) => (
                  <CommandItem
                    key={m.id}
                    value={m.id}
                    onSelect={() => handleSelect(m.id)}
                  >
                    <span className="truncate">{m.id}</span>
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === m.id ? 'opacity-100' : 'opacity-0'
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
  );
};