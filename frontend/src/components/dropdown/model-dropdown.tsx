import {Skeleton} from "@/components/ui/skeleton.tsx";
import {ChatResponse} from "@/types/providers/ollama";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Ollama} from "@/services/provider/ollama/ollama.ts";
import {OLLAMA_SETTINGS} from "@/settings/ollama.ts";
import {useModels} from "@/hooks/use-models.ts";
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
import {useState} from "react";

const ollama: Ollama = new Ollama(OLLAMA_SETTINGS);

export default function ModelDropdown(props: any) {
    const models = useModels(ollama);
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(props.currentModel ?? "")

    function updateModel(elem: string) {
        props.updateModel(elem);
    }

    return(
        <>
            {models?.isLoading && !props.hideStatus && (
                <span className="size-2 rounded-full bg-primary-400 border border-primary-200 animate-pulse"/>
            )}
            {models?.isError && !props.hideStatus && (
                <span className="size-2 rounded-full bg-red-400 border border-red-200"/>
            )}
            {models?.isSuccess && !props.hideStatus && (
                <>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="size-2 rounded-full bg-green-300 border border-green-200"/>
                            <TooltipContent className="border-green-200 text-green-200 border">
                                Online
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </>
            )}

            {models?.isLoading && (
                <Skeleton className="items-start w-[150px] ">
                    <div className="items-start h-9 [&_[data-description]]:hidden w-full"/>
                </Skeleton>
            )}

            {models?.isError && (
                <div className="items-start w-[150px] ">
                    <div
                        className="h-9 border border-red-400 text-red-400 text-sm justify-center flex items-center rounded-lg w-full [&_[data-description]]:hidden">
                        {models.error.name}
                    </div>
                </div>
            )}

            {models?.isSuccess && (
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
                                    {models?.data?.models?.map((m: ChatResponse) => (
                                        <CommandItem
                                            key={m.model}
                                            value={m.model}
                                            onSelect={(currentValue) => {
                                                setValue(currentValue === value ? "" : currentValue)
                                                setOpen(false)
                                                updateModel(currentValue)
                                            }}
                                        >
                                            {m.model}
                                            <CheckIcon
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    value === m.model ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}

        </>
    )
}