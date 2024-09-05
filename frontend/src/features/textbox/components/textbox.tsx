import { Textarea } from "@/components/ui/textarea.tsx";
import React, { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

export interface ITextbox {
    value: string;
    model: string;
    setValue: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const DEFAULT_IDX: number = -1;

export function Textbox({ value, setValue, onSubmit, model }: ITextbox) {
    const [history, setHistory] = useState<string[]>([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] =
        useState<number>(DEFAULT_IDX);
    const ref = useRef<HTMLTextAreaElement>(null);

    function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        event.target.style.height = "";
        event.target.style.height = Math.min(event.target.scrollHeight, 200) + "px";
        setValue(event.target.value);
    }

    function setCaretToEnd() {
        const element = ref.current;
        if (element) {
            const valueLength = element.value.length;
            element.selectionStart = valueLength;
            element.selectionEnd = valueLength;
            element.focus();
        }
    }

    function onKeyPress(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        switch (event.key) {
            case "ArrowUp":
                if (history.length > 0 && currentHistoryIndex < history.length - 1) {
                    const newIndex = currentHistoryIndex + 1;
                    setCurrentHistoryIndex(newIndex);
                    setValue(history[history.length - newIndex - 1]);
                    setTimeout(setCaretToEnd, 0);
                }
                break;
            case "ArrowDown":
                if (history.length > 0 && currentHistoryIndex > 0) {
                    const newIndex = currentHistoryIndex - 1;
                    setCurrentHistoryIndex(newIndex);
                    setValue(history[history.length - newIndex - 1]);
                    setTimeout(setCaretToEnd, 0);
                } else if (currentHistoryIndex === 0) {
                    setCurrentHistoryIndex(DEFAULT_IDX);
                    setValue("");
                }
                break;
            case "Enter":
                if (event.shiftKey) {
                    event.target.style.height = "";
                    event.target.style.height = Math.min(event.target.scrollHeight, 200) + "px";
                    setValue(value + "\n");
                    event.preventDefault();
                } else {
                    event.preventDefault();
                    handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
                    setHistory((prevHistory) => [...prevHistory, value]);
                    setCurrentHistoryIndex(DEFAULT_IDX);
                }
                break;
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(event);
    }

    return (
        <div className="max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl 2xl:max-w-6xl px-2.5 md:px-4 mx-auto inset-x-0 ring-inset p-2 relative overflow-clip rounded-xl border border-foreground/25 bg-accent focus-within:ring-2 h-full w-full focus-within:ring-ring">
            <Textarea
                id="chatMessage"
                key="chatMessageArea"
                className="focus:border-transparent pt-2 pb-3 scrollbar-hidden focus-visible:ring-0 resize-none border-0 shadow-none items-center align-middle"
                value={value}
                rows={1}
                onChange={(event) => handleChange(event)}
                onKeyDown={onKeyPress}
                placeholder="Send a message"
            />
            <div className="absolute bottom-2 right-3">
                <Button
                    type="submit"
                    disabled={value.length === 0 || !model}
                    onClick={(event: React.FormEvent<any>) => handleSubmit(event)}
                    size="sm"
                    className="ml-auto gap-1.5 text-foreground"
                >
                    <Send className="size-3" />
                    {model}
                    <span className="sr-only">Send Message</span>
                </Button>
            </div>
        </div>
    );
}
