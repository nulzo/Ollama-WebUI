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
      <div className="inset-x-0 border-spacing-2 bg-transparent mx-auto px-[75px] w-full max-w-6xl overflow-hidden">
        <div className="relative z-10 inset-x-0 border-input border-spacing-2 focus-within:border-primary shadow-sm mx-auto border rounded-lg ring-primary/50 focus-within:ring-1 w-full max-w-6xl overflow-hidden">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="bg-transparent px-4 py-3 rounded-lg focus:ring-0 focus:ring-none w-full text-foreground text-sm placeholder:text-muted-foreground resize-none focus:outline-none"
            style={{ minHeight: '44px', maxHeight: '200px' }}
          />
          
          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Uploaded ${index + 1}`}
                    className="rounded w-12 h-12 object-cover"
                  />
                  <button
                    onClick={() => onRemoveImage(index)}
                    className="-top-1 -right-1 absolute bg-background opacity-0 group-hover:opacity-100 p-0.5 border rounded-full transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center px-2 pb-2">
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-5 h-5"
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
                    className="w-5 h-5"
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
                    className="w-5 h-5"
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
                      className="w-5 h-5"
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
              <span className="text-muted-foreground text-xs">
                {text.length > 0 ? text.length : ''}
              </span>
              <Button
                size="icon"
                className="px-2 w-fit h-8 text-xs"
                onClick={handleSubmit}
                disabled={!text.trim() || model.length === 0}
              >
                Send
                <kbd className="inline-flex justify-center items-center gap-1 px-1 py-1 rounded font-mono text-sm">
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