import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useModels } from "@/features/models/api/get-models";
import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatModels } from '../utils/format-models';


interface ModelSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function ModelSelect({ value, onValueChange }: ModelSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: modelsData, isLoading } = useModels();

  const formattedModels = useMemo(() => 
    formatModels(modelsData), 
    [modelsData]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full"
          disabled={isLoading}
        >
          {value
            ? formattedModels.find((model) => model.value === value)?.label
            : "Select model..."}
          <ChevronsUpDown className="opacity-50 ml-2 w-4 h-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandEmpty>No model found.</CommandEmpty>
          <ScrollArea className="h-[300px]">
            <CommandGroup heading="Ollama Models">
              {formattedModels
                .filter(model => model.provider === 'ollama')
                .map((model) => (
                  <CommandItem
                    key={model.value}
                    value={model.value}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === model.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col gap-1">
                      <span>{model.label}</span>
                      <div className="flex gap-1">
                        {'size' in model.details && (
                          <Badge variant="outline" className="text-xs">
                            {model.details.size}
                          </Badge>
                        )}
                        {'format' in model.details && (
                          <Badge variant="outline" className="text-xs">
                            {model.details.format}
                          </Badge>
                        )}
                        {'quantization' in model.details && (
                          <Badge variant="outline" className="text-xs">
                            {model.details.quantization}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandGroup heading="OpenAI Models">
              {formattedModels
                .filter(model => model.provider === 'openai')
                .map((model) => (
                  <CommandItem
                    key={model.value}
                    value={model.value}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === model.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col gap-1">
                      <span>{model.label}</span>
                      <div className="flex gap-1">
                        {'owner' in model.details && (
                          <Badge variant="outline" className="text-xs">
                            {model.details.owner}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}