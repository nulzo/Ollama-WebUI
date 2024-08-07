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
  setValue: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const DEFAULT_IDX: number = -1;

export function Textbox({ value, setValue, onSubmit }: ITextbox) {
  const [history, setHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] =
    useState<number>(DEFAULT_IDX);
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
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
    <div className="ring-inset p-2 relative overflow-visible rounded-lg border bg-background focus-within:ring-2 h-full w-full focus-within:ring-ring">
      <Textarea
        id="chatMessage"
        ref={ref}
        key="chatMessageArea"
        className="focus:border-transparent focus-visible:ring-0 resize-none border-0 shadow-none items-center bg-background h-full align-middle"
        value={value}
        onChange={(event) => handleChange(event)}
        onKeyDown={onKeyPress}
      />
      <div className="absolute items-center bottom-3 left-3">
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
        </div>
        <div className="absolute bottom-3 right-3">
        <Button
          type="submit"
          disabled={value.length === 0 || value.length === 0}
          onClick={(event: React.FormEvent<any>) => handleSubmit(event)}
          size="sm"
          className="ml-auto gap-1.5 text-foreground"
        >
          <Send className="size-3" />
          <span className="sr-only">Send Message</span>
        </Button>
      </div>
    </div>
  );
}
