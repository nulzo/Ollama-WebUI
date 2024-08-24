import { Textarea } from "@/components/ui/textarea";
import React, { useState, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import { Mic, Paperclip, Send, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    event.target.style.height = "";
    event.target.style.height = Math.min(event.target.scrollHeight, 200) + "px";
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
    <div className="max-w-sm lg:max-w-6xl px-2.5 md:px-4 mx-auto inset-x-0 ring-inset p-1.5 relative overflow-visible rounded-xl border border-foreground/25 bg-accent focus-within:ring-2 h-full w-full focus-within:ring-ring">
      <Textarea
        id="chatMessage"
        ref={ref}
        key="chatMessageArea"
        className="focus:border-transparent scrollbar-hidden py-3 focus-visible:ring-0 resize-none border-0 shadow-none items-center h-[48px] align-middle"
        value={value}
        rows={1}
        onChange={(event) => handleChange(event)}
        onKeyDown={onKeyPress}
        placeholder="Send a message"
      />

      {/* <div className="absolute items-center bottom-3 left-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Paperclip className="size-3" />
                <span className="sr-only">Attach file</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Attach File</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Image className="size-3" />
                <span className="sr-only">Upload Image</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Upload Image</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Mic className="size-3" />
                <span className="sr-only">Use Microphone</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Use Microphone</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div> */}
      <div className="absolute bottom-3.5 right-3">
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
