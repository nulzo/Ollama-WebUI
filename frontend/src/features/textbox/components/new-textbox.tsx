import React, { useState, useRef, useEffect } from 'react';
import { Command, Copy, CornerDownLeft, Image as ImageIcon, Redo, Undo, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DynamicTextareaProps {
  text: string;
  setText: (text: string) => void;
  onSubmit: () => void;
  model: string;
  onImageUpload: (images: string[]) => void;
  onRemoveImage: (index: number) => void;
  uploadedImages: string[];
  placeholder?: string;
  maxLength?: number;
}

export default function DynamicTextarea({
  placeholder = 'Message CringeGPT ...',
  maxLength = 1000000,
  onSubmit,
  onImageUpload,
  onRemoveImage,
  setText,
  text,
  model,
  uploadedImages,
}: DynamicTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit();
      setText('');
    }
  };

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'));
    
    for (const item of imageItems) {
      const file = item.getAsFile();
      if (file) {
        const base64 = await convertFileToBase64(file);
        onImageUpload([base64]);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      handleSubmit();
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const base64Images = await Promise.all(
      files.map(file => convertFileToBase64(file))
    );
    onImageUpload(base64Images);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('paste', handlePaste);
    }
    return () => {
      if (textarea) {
        textarea.removeEventListener('paste', handlePaste);
      }
    };
  }, []);

  const handleCopy = () => navigator.clipboard.writeText(text);

  return (
    <TooltipProvider>
      <div className="w-full mx-auto bg-transparent max-w-6xl inset-x-0 border-spacing-2 overflow-hidden px-[75px]">
        <div className="mx-auto relative rounded-lg shadow-sm border border-input z-10 max-w-6xl inset-x-0 border-spacing-2 overflow-hidden ring-primary/50 focus-within:border-primary focus-within:ring-1 w-full">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="placeholder:text-muted-foreground text-foreground w-full resize-none bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-0 focus:ring-none rounded-lg"
            style={{ minHeight: '44px', maxHeight: '200px' }}
          />
          
          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Uploaded ${index + 1}`}
                    className="h-12 w-12 object-cover rounded"
                  />
                  <button
                    onClick={() => onRemoveImage(index)}
                    className="absolute -top-1 -right-1 bg-background border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

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
                  <Button
                    className="h-5 w-5"
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                  >
                    <Copy className="size-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy to clipboard</p>
                </TooltipContent>
              </Tooltip>

              {uploadedImages.length === 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="h-5 w-5"
                      variant="link"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="size-3 stroke-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload Image (requires vision capable model)</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {text.length > 0 ? text.length : ''}
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
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}