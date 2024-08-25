import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Ellipsis} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {useSettings} from "@/hooks/use-settings.ts";
import {Storage} from "@/services/storage.ts";
import {DATABASE_SETTINGS} from "@/settings/database.ts";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form.tsx";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {useModels} from "@/hooks/use-models.ts";
import {useState} from "react";
import {Ollama} from "@/services/ollama.ts";
import {OLLAMA_SETTINGS} from "@/settings/ollama.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {ChatResponse} from "@/types/ollama";
import {CaretSortIcon, CheckIcon} from "@radix-ui/react-icons";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";
import {cn} from "@/lib/utils.ts";

const formSchema = z.object({
    ollama_ip: z.string(),
    ollama_default_model: z.string(),
})

const storage: Storage = new Storage(DATABASE_SETTINGS);
const ollama: Ollama = new Ollama(OLLAMA_SETTINGS);


export default function SettingsModal({currentModel, updateModel}) {
    const settings = useSettings(storage);
    const models = useModels(ollama);
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(currentModel ?? "")

    function update(elem: string) {
        updateModel(elem);
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ollama_ip: "",
            ollama_default_model: ""
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const setting = {
            id: 1,
            ollama_ip: values.ollama_ip,
            ollama_default_model: values.ollama_default_model
        }
        storage.setSettings(setting);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Ellipsis className="size-4" strokeWidth="1.5"/></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        Edit Ollama Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Update the base IP address used for Ollama and the default model.
                    </DialogDescription>
                </DialogHeader>
                {!settings?.isLoading && (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="ollama_ip"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Ollama Host IP</FormLabel>
                                        <FormControl>
                                            <Input placeholder={settings?.data[0]?.ollama_ip ?? "Enter Host IP..."} defaultValue={settings?.data[0]?.ollama_ip ?? ""} {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ollama_default_model"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>
                                            Ollama Default Model
                                        </FormLabel>
                                        <FormControl>
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
                                                                                update(currentValue)
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
                                            {/*<Input*/}
                                            {/*    placeholder={settings?.data[0]?.ollama_default_model ?? "Enter Default Model..."}*/}
                                            {/*    defaultValue={settings?.data[0]?.ollama_default_model ?? ""} {...field}*/}
                                            {/*/>*/}
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Save Settings</Button>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}