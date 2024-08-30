import { useEffect, useState } from "react";
import { useModelStore } from "../store/model-store";
import {ChatResponse} from "@/types/providers/ollama";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils.ts"
import { Button } from "@/components/ui/button.tsx"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command.tsx"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover.tsx"

export const ModelSelect = () => {
    const { models, selectedModel, loading, error, fetchModels, setSelectedModel } = useModelStore();
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string>(selectedModel ? selectedModel.id : "");

    console.log(models);

    useEffect(() => {
        fetchModels();
    }, [fetchModels]);

    useEffect(() => {
        if (selectedModel && selectedModel.id !== value) {
            setValue(selectedModel.id);
        }
    }, [selectedModel, value]);

    const handleSelect = (model: string) => {
        const selected = models.find(m => m.id === model);
        setValue(selected?.id || "");
        setSelectedModel(selected || null);
        setOpen(false);
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
                    {value
                        ? models?.data?.models?.find((model: ChatResponse) => model.model === value)?.model
                        : "Select model..."}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandInput placeholder="Search model..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No model found.</CommandEmpty>
                        <CommandGroup>
                        {models.map((model) => (
                            <CommandItem
                                key={model.id}
                                value={model.id}
                                onSelect={() => handleSelect(model.id)}
                            >
                                {model.model}
                                <CheckIcon
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        value === model.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}