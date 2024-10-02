import React, { useState, useRef, useEffect } from 'react';
import { Command, Copy, CornerDownLeft, Image, Redo, Undo, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DynamicTextareaProps {
  placeholder?: string;
  maxLength?: number;
  onSubmit: (text: string, image: string | null) => void;
  setText: (value: string) => void;
  onImageUpload: (base64Image: string | null, fileName: string | null) => void;
  text: string;
  model: string;
  uploadedImageName: string | null;
}

export default function DynamicTextarea({
  placeholder = 'Message CringeGPT ...',
  maxLength = 1000000,
  onSubmit,
  onImageUpload,
  setText,
  text,
  model,
  uploadedImageName,
}: DynamicTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<string | null>(null);

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
      onSubmit(text, imageBase64);
      setText('');
      setImageBase64(null);
      onImageUpload(null, null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleUpload = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String);
        setImageFile(file.name);
        onImageUpload(base64String, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    setImageFile(null);
    onImageUpload(null, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          <TextareaFooter
            text={text}
            model={model}
            handleSubmit={handleSubmit}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
            handleCopy={handleCopy}
            handleUpload={handleUpload}
            handleRemoveImage={handleRemoveImage}
            uploadedImageName={imageFile}
            historyIndex={historyIndex}
            historyLength={history.length}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

interface TextareaFooterProps {
  text: string;
  model: string;
  handleSubmit: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleCopy: () => void;
  handleUpload: () => void;
  handleRemoveImage: () => void;
  uploadedImageName: string | null;
  historyIndex: number;
  historyLength: number;
}

const TextareaFooter: React.FC<TextareaFooterProps> = ({
  text,
  model,
  handleSubmit,
  handleUndo,
  handleRedo,
  handleCopy,
  handleUpload,
  handleRemoveImage,
  uploadedImageName,
  historyIndex,
  historyLength,
}) => (
  <div className="pb-2 px-2 flex justify-between items-center">
    <div className="flex space-x-2">
      <TooltipButton
        onClick={handleUndo}
        disabled={historyIndex === 0}
        icon={<Undo className="size-3" />}
        tooltipText="Undo"
      />
      <TooltipButton
        onClick={handleRedo}
        disabled={historyIndex === historyLength - 1}
        icon={<Redo className="size-3" />}
        tooltipText="Redo"
      />
      <TooltipButton
        onClick={handleCopy}
        icon={<Copy className="size-3" />}
        tooltipText="Copy to clipboard"
      />
      {!uploadedImageName && (
        <TooltipButton
          onClick={handleUpload}
          icon={<Image className="size-3 stroke-muted-foreground" />}
          tooltipText="Upload Image (requires vision capable model)"
          variant="link"
        />
      )}
      {uploadedImageName && (
        <div className="flex items-center space-x-1">
          <span className="text-xs text-muted-foreground">{uploadedImageName}</span>
          <Button className="h-4 w-4 p-0" variant="ghost" size="icon" onClick={handleRemoveImage}>
            <X className="size-3" />
          </Button>
        </div>
      )}
    </div>
    <div className="flex items-center space-x-2">
      <span className="text-xs text-muted-foreground">{text.length > 0 ? text.length : ''}</span>
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
);

interface TooltipButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  tooltipText: string;
  variant?: 'ghost' | 'link';
}

const TooltipButton: React.FC<TooltipButtonProps> = ({
  onClick,
  disabled = false,
  icon,
  tooltipText,
  variant = 'ghost',
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        className="h-5 w-5"
        variant={variant}
        size="icon"
        onClick={onClick}
        disabled={disabled}
      >
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{tooltipText}</p>
    </TooltipContent>
  </Tooltip>
);
