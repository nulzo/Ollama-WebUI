import React, { useState, useRef, useEffect } from 'react';
import { Command, Copy, CornerDownLeft, Redo, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DynamicTextareaProps {
  placeholder?: string;
  maxLength?: number;
  onSubmit?: (text: string) => void;
  setText: (value: string) => void;
  text: string;
  model: string;
}

export default function DynamicTextarea({
  placeholder = 'Message CringeGPT ...',
  maxLength = 1000,
  onSubmit = () => {},
  setText,
  text,
  model,
}: DynamicTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setText(value);
      setHistory(prev => [...prev.slice(0, historyIndex + 1), value]);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setText(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setText(history[historyIndex + 1]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <TooltipProvider>
      <div className="-mb-0.5 mx-auto inset-x-0 bg-transparent flex justify-center">
        <div className="flex flex-col max-w-6xl px-2.5 md:px-6 w-full">
          <div className="relative">
            <div className="absolute -top-12 left-0 right-0 justify-center z-30 pointer-events-none hidden">
              <button className="bg-white border border-gray-100 dark:border-none dark:bg-white/20 p-1.5 rounded-full pointer-events-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="w-full relative"> </div>
        </div>
      </div>
      <div className="w-full max-w-3xl mx-auto bg-background/50 backdrop-blur-lg">
        <div className="relative bg-background/50 backdrop-blur-lg rounded-lg shadow-sm border border-input z-10 max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl 2xl:max-w-6xl inset-x-0 border-spacing-2 overflow-hidden ring-primary/50 focus-within:border-primary focus-within:ring-1 w-full">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-0 focus:ring-none rounded-lg"
            style={{ minHeight: '44px', maxHeight: '250px' }}
          />
          <div className="absolute bottom-2 right-2 flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              {text.length == 0 ? '' : text.length}
            </span>
            <Button
              size="icon"
              className="h-8 w-fit text-xs px-2"
              onClick={handleSubmit}
              disabled={!text.trim() || model.length === 0}
            >
              Send
              <kbd className="px-1 gap-1 rounded inline-flex justify-center items-center py-1 font-mono text-sm">
                <Command className="size-2" />
                <CornerDownLeft className="size-2" />
              </kbd>
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <div className="pb-2 px-2 flex justify-between items-center">
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-5 w-5"
                    variant="ghost"
                    size="icon"
                    onClick={handleUndo}
                    disabled={historyIndex === 0}
                  >
                    <Undo className="size-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-5 w-5"
                    variant="ghost"
                    size="icon"
                    onClick={handleRedo}
                    disabled={historyIndex === history.length - 1}
                  >
                    <Redo className="size-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="h-5 w-5" variant="ghost" size="icon" onClick={handleCopy}>
                    <Copy className="size-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy to clipboard</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center space-x-2"> </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
