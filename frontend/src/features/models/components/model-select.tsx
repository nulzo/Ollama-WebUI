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
import { Badge } from '@/components/ui/badge';
import { formatModels } from '../utils/format-models';

interface ModelSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
}

type Model = {
  value: string;
  label: string;
  provider: string;
  details: Record<string, string>;
};

export function ModelSelect({ value, onValueChange }: ModelSelectProps) {
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
  
  const openaiModels = useMemo(() => 
    filteredModels.filter(model => model.provider === 'openai'), 
    [filteredModels]
  );
  
  const ollamaModels = useMemo(() => 
    filteredModels.filter(model => model.provider === 'ollama'), 
    [filteredModels]
  );

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Loading models...
      </Button>
    );
  }

  if (!formattedModels.length) {
    return (
      <Button variant="outline" className="w-full" disabled>
        No models available
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full"
        >
          {value ? formattedModels.find(model => model.value === value)?.label : 'Select model...'}
          <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search models..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <ScrollArea className="h-[300px]">
              {ollamaModels.length > 0 && (
                <CommandGroup heading="Ollama Models">
                  {ollamaModels.map(model => (
                    <CommandItem
                      key={model.value}
                      value={model.value}
                      onSelect={currentValue => {
                        onValueChange(currentValue);
                        setOpen(false);
                        setSearch('');
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === model.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {model.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {openaiModels.length > 0 && (
                <CommandGroup heading="OpenAI Models">
                  {openaiModels.map(model => (
                    <CommandItem
                      key={model.value}
                      value={model.value}
                      onSelect={currentValue => {
                        onValueChange(currentValue);
                        setOpen(false);
                        setSearch('');
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === model.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {model.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}