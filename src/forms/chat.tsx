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
    const {handleSubmit, control, watch, reset
    } = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: { message: "" }
    });

    const minHeight: number = 52;
    const formInputs: string = watch("message");

    async function onSubmit(form: { message: string }) {
        setResponse({
            model: "ethan",
            stream: false,
            messages: [
                {
                    role: "user",
                    content: form.message,
                },
            ],
        });
        reset();
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit({message: formInputs});
        }
        const inputHeight = event.target.scrollHeight;
        if(ref.current) {
            ref.current.style.height = `${inputHeight > minHeight ? inputHeight - 16 : minHeight}px`;
            ref.current.style.overflowY = inputHeight > 250 ? "auto" : "hidden";
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="relative flex h-full flex-1 flex-col">
                <div className="flex w-full items-center">
                    <div
                        className="overflow-hidden flex transition-colors border-2 border-white/50 [&:has(textarea:focus)]:border-[#3E63DD] flex-col w-full flex-grow relative dark:text-white rounded-xl">
                        <Controller
                            control={control}
                            name="message"
                            render={({field}) => (
                                <textarea
                                    value={field.value}
                                    ref={ref}
                                    onKeyDown={handleKeyDown}
                                    onChange={field.onChange}
                                    style={{ paddingTop: `${.85}rem` }}
                                    className="m-0 w-full flex h-[52px] resize-none items-center align-middle border-0 bg-transparent focus:ring-0 focus-visible:ring-0 dark:bg-transparent py-[10px] pr-10 md:py-2 md:pr-12 max-h-52 placeholder-black/50 dark:placeholder-white/50 pl-4 md:pl-6"
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

