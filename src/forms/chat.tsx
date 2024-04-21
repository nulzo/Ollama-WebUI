import { Button } from "@radix-ui/themes";
import { z } from "zod";
import {Controller, useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {SetStateAction, useRef} from "react";
import {RocketIcon} from "@radix-ui/react-icons";

const FormSchema = z.object({
    message: z
        .string({ required_error: "You must enter data!" })
        .min(1, { message: "You must enter data!" }),
});

export default function SummarizeForm({ setResponse}: {setResponse: SetStateAction<any>}) {
    const ref = useRef<HTMLTextAreaElement>(null);
    const {handleSubmit, control, watch
    } = useForm({
        resolver: zodResolver(FormSchema) ,
        defaultValues: { message: "" }
    });

    const formInputs: string = watch("message");
    async function onSubmit(form: { message: string }) {
        setResponse({
            model: "midjourney",
            stream: false,
            messages: [
                {
                    role: "user",
                    content: form.message,
                },
            ],
        });
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="relative flex h-full flex-1 flex-col">
                <div className="flex w-full items-center">
                    <div
                        className="overflow-hidden transition-colors border-2 items-center align-middle border-white/50 [&:has(textarea:focus)]:border-indigo-500 [&:has(textarea:focus)]:shadow-[0_2px_6px_rgba(0,0,0,.05)] flex flex-col w-full flex-grow relative dark:text-white rounded-xl">
                        <Controller
                            control={control}
                            name="message"
                            render={({field}) => (
                                <textarea
                                    value={field.value}
                                    ref={ref}
                                    onChange={field.onChange}
                                    className="m-0 w-full h-[52px] resize-none items-center align-middle border-0 bg-transparent pt-2 focus:ring-0 focus-visible:ring-0 dark:bg-transparent py-[10px] pr-10 md:py-2 md:pr-12 max-h-52 placeholder-black/50 dark:placeholder-white/50 pl-4 md:pl-6"
                                />
                            )}
                        />
                        <div className="absolute bottom-2.5 right-3">
                            <Button type="submit" disabled={formInputs?.length === 0}>
                                <RocketIcon/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

