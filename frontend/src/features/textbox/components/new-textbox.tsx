import React, { useState, useRef, useEffect } from 'react';
import { Command, CornerDownLeft, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PromptCommand } from '@/features/chat/components/prompts/prompt-command';
import { usePrompts } from '@/features/prompts/api/get-prompts';

interface DynamicTextareaProps {
  text: string;
  setText: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  model: string;
  onImageUpload: (images: string[]) => void;
  onRemoveImage: (index: number) => void;
  uploadedImages: string[];
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  isGenerating?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
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
  disabled,
  onKeyDown,
  onCancel,
  isGenerating,
}: DynamicTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptSearchTerm, setPromptSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: prompts } = usePrompts();

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
    if (event.key === '/') {
      setIsPromptOpen(true);
      setPromptSearchTerm('');
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      handleSubmit();
    } else {
      onKeyDown?.(event);
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
    const base64Images = await Promise.all(files.map(file => convertFileToBase64(file)));
    onImageUpload(base64Images);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePromptSelect = (content: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const before = text.slice(0, cursorPosition);
    const after = text.slice(cursorPosition);
    
    // Remove the trigger character
    const newBefore = before.replace(/\/[^\s]*$/, '');
    setText(`${newBefore}${content}${after}`);
    setIsPromptOpen(false);
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

  return (
    <TooltipProvider>
      <div className="inset-x-0 bg-transparent mx-auto w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        {isPromptOpen && (
          <PromptCommand
            isOpen={isPromptOpen}
            onClose={() => setIsPromptOpen(false)}
            onSelect={handlePromptSelect}
            searchTerm={promptSearchTerm}
          />
        )}
        
        <div className="relative border ring-offset-0 border-input flex flex-col w-full py-2 px-2 bg-secondary backdrop-blur-sm ring-0 rounded-lg focus-within:border-primary focus-within:ring-primary focus-within:ring-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="min-h-[20px] w-full resize-none bg-transparent px-3 py-[10px] focus:outline-none text-sm placeholder:text-muted-foreground"
            style={{ maxHeight: '200px' }}
            disabled={disabled}
          />

          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap px-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Uploaded ${index + 1}`}
                    className="rounded w-12 h-12 object-cover"
                  />
                  <button
                    onClick={() => onRemoveImage(index)}
                    className="absolute -top-1.5 -right-1.5 bg-background hover:bg-muted opacity-0 group-hover:opacity-100 p-0.5 border rounded-full transition-all duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end items-center px-2 pb-2">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground text-xs">
                {text.length > 0 ? text.length : ''}
              </span>

              {uploadedImages.length === 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="px-2 h-8 text-xs"
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload Image (requires vision capable model)</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {isGenerating ? (
                <Button variant="outline" className="px-2 h-8 text-xs" onClick={onCancel}>
                  <X className="mr-1 size-3" />
                  Cancel
                </Button>
              ) : (
                <Button
                  className="px-2 h-8 text-xs"
                  onClick={handleSubmit}
                  disabled={!text.trim() || model.length === 0}
                >
                  Send
                  <kbd className="inline-flex justify-center items-center gap-1 px-1 py-1 rounded font-geistmono text-sm">
                    <Command className="size-2" />
                    <CornerDownLeft className="size-2" />
                  </kbd>
                  <span className="sr-only">Send message</span>
                </Button>
              )}
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
