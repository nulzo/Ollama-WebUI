import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Ellipsis} from "lucide-react";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import React from "react";
import {useSettings} from "@/hooks/use-settings.ts";
import {Storage} from "@/services/storage.ts";
import {DATABASE_SETTINGS} from "@/settings/database.ts";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form.tsx";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
    ollama_ip: z.string()
})

const storage: Storage = new Storage(DATABASE_SETTINGS);


export default function SettingsModal() {
    const settings = useSettings(storage);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ollama_ip: ""
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        const setting = {
            id: 1,
            ollama_ip: values.ollama_ip
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
                    <DialogTitle>Edit Ollama Configuration</DialogTitle>
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
                            <Button type="submit">Save Settings</Button>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}