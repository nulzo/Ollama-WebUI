import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useModels } from '@/features/models/api/get-models';
import { useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatModels } from '../utils/format-models';
import { Badge } from '@/components/ui/badge';

interface ModelSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

type Model = {
  value: string;
  label: string;
  provider: string;
  details: Record<string, string>;
};

export function ModelSelect({ value, onValueChange, className }: ModelSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: modelsData, isLoading } = useModels();

  const formattedModels: Model[] = useMemo(() => {
    if (!modelsData) return [];
    try {
      return formatModels(modelsData);
    } catch (error) {
      console.error('Error formatting models:', error);
      return [];
    }
  }, [modelsData]);

  const filteredModels = useMemo(() => {
    if (!search) return formattedModels;
    return formattedModels.filter(model =>
      model.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [formattedModels, search]);

  // Group models by provider
  const groupedModels = useMemo(() => {
    return filteredModels.reduce(
      (groups, model) => {
        if (!groups[model.provider]) {
          groups[model.provider] = [];
        }
        groups[model.provider].push(model);
        return groups;
      },
      {} as Record<string, Model[]>
    );
  }, [filteredModels]);

  if (isLoading) {
    return (
      <Button variant="ghost" className="w-full" disabled>
        Loading models...
      </Button>
    );
  }

  if (!formattedModels.length) {
    return (
      <Button variant="ghost" className="w-full" disabled>
        No models available
      </Button>
    );
  }

  // Helper to capitalize provider names
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  console.log(formattedModels);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between w-full', className)}
        >
          <div className="flex items-center truncate">
            <span className="truncate">
              {value
                ? formattedModels.find(model => model.value === value)?.label
                : 'Select model...'}
            </span>
          </div>
          <ChevronsUpDown className="opacity-50 ml-2 size-3.5 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[400px]" align="start">
        <Command shouldFilter={false} className="max-h-[400px]">
          <CommandInput placeholder="Search models..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <ScrollArea className="h-[300px]">
              {Object.entries(groupedModels).map(([provider, models]) => (
                <CommandGroup key={provider} heading={`${capitalize(provider)} Models`}>
                  {models.map(model => (
                    <CommandItem
                      key={model.value}
                      value={model.value}
                      className="relative flex items-center h-8 text-sm"
                      onSelect={currentValue => {
                        onValueChange(currentValue);
                        setOpen(false);
                        setSearch('');
                      }}
                    >
                      <div className="flex items-center w-full min-w-0">
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4 shrink-0',
                            value === model.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <Badge variant="outline" className="mr-2 shrink-0">
                          {capitalize(provider)}
                        </Badge>
                        <span className="min-w-0 truncate">{model.label}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
