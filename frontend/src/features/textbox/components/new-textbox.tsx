import React, { useState, useRef, useEffect, useCallback, memo, useLayoutEffect, useMemo } from 'react';
import { Command, Copy, CornerDownLeft, Paperclip, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PromptCommand } from '@/features/chat/components/prompts/prompt-command';
import { usePrompts } from '@/features/prompts/api/get-prompts';
import { useClipboard } from '@/hooks/use-clipboard';

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

// Interface for the MemoizedTooltipButton component
interface TooltipButtonProps {
  onClick: () => void;
  tooltipText: string;
  icon: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

// Create a memoized tooltip button component to prevent re-renders
const MemoizedTooltipButton = memo(({ 
  onClick, 
  tooltipText, 
  icon, 
  className = "px-2 h-7 w-7 text-xs bg-transparent hover:bg-transparent shadow-none hover:text-foreground text-muted-foreground",
  disabled = false
}: TooltipButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        className={className}
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
));

// Memoize the textarea component to prevent re-renders
const MemoizedTextarea = memo(({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  textareaRef,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled?: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}) => (
  <textarea
    ref={textareaRef}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
    rows={1}
    className="w-full resize-none bg-transparent py-[6px] pr-[50px] focus:outline-none text-sm placeholder:text-muted-foreground transition-all duration-200"
    style={{ maxHeight: '200px' }}
    disabled={disabled}
  />
));

// Memoize the token count display to prevent re-renders
const TokenCount = memo(({ count }: { count: number }) => (
  <span className="text-muted-foreground text-xs">
    {count > 0 ? (
      `${count} tokens`
    ) : (
      <span className="text-xs opacity-0">0 tokens</span>
    )}
  </span>
));

// Memoize the button container to prevent re-renders
const ButtonContainer = memo(({ 
  onCopy, 
  text, 
  onUploadClick, 
  uploadedImages, 
  isGenerating, 
  onCancel, 
  onSubmit, 
  hasText, 
  hasModel,
  disabled
}: { 
  onCopy: (text: string) => void;
  text: string;
  onUploadClick: () => void;
  uploadedImages: string[];
  isGenerating?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  hasText: boolean;
  hasModel: boolean;
  disabled?: boolean;
}) => (
  <div className="absolute right-2 bottom-2 flex items-center bg-secondary">
    {!isGenerating && (
      <MemoizedTooltipButton
        onClick={() => onCopy(text)}
        tooltipText="Copy text"
        icon={<Copy className="size-4" />}
        disabled={disabled}
      />
    )}
    {uploadedImages.length === 0 && !isGenerating && (
      <MemoizedTooltipButton
        onClick={onUploadClick}
        tooltipText="Upload Image (requires vision capable model)"
        icon={<Paperclip className="size-3.5" />}
        disabled={disabled}
      />
    )}

    {isGenerating ? (
      <Button variant="outline" className="px-2 h-8 text-xs" onClick={onCancel}>
        <X className="mr-1 size-3" />
        Cancel
      </Button>
    ) : (
      <Button
        className="px-2 ml-2 h-8 text-xs whitespace-nowrap"
        onClick={onSubmit}
        disabled={(!hasText && uploadedImages.length === 0) || !hasModel || disabled}
      >
        <Send className="mr-1 size-3" />
        <kbd className="inline-flex justify-center items-center gap-1 px-1 py-1 rounded font-geistmono text-sm">
          <Command className="size-2" />
          <CornerDownLeft className="size-2" />
        </kbd>
        <span className="sr-only">Send message</span>
      </Button>
    )}
  </div>
));

// Memoize the uploaded images container to prevent re-renders
const UploadedImages = memo(({ 
  images, 
  onRemove,
  disabled
}: { 
  images: string[]; 
  onRemove: (index: number) => void;
  disabled?: boolean;
}) => {
  if (images.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <img
            src={image}
            alt={`Uploaded ${index + 1}`}
            className="rounded w-12 h-12 object-cover"
          />
          <button
            onClick={() => onRemove(index)}
            className="absolute -top-1.5 -right-1.5 bg-background hover:bg-muted opacity-0 group-hover:opacity-100 p-0.5 border rounded-full transition-all duration-200"
            disabled={disabled}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
});

function DynamicTextarea({
  placeholder = 'Message CringeGPT ...',
  maxLength = 1000000,
  onSubmit,
  onImageUpload,
  onRemoveImage,
  setText: setParentText,
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
  const historyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHeightRef = useRef<string>('auto');

  const { copy } = useClipboard();

  const handleCopy = useCallback((text: string) => {
    copy(text);
  }, [copy]);

  // Use useLayoutEffect for DOM measurements to prevent layout thrashing
  useLayoutEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      
      // Reset height to auto first to properly calculate the new height
      textarea.style.height = '0px';
      
      // Get the scroll height which represents the content height
      const scrollHeight = Math.min(textarea.scrollHeight, 200); // Respect maxHeight
      
      // Set the new height
      textarea.style.height = `${scrollHeight}px`;
      
      // Update the last height reference
      lastHeightRef.current = `${scrollHeight}px`;
    }
  }, [text]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setParentText(value);
      
      // Debounce history updates to prevent excessive state changes
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      
      historyTimeoutRef.current = setTimeout(() => {
        setHistory(prev => [...prev.slice(0, historyIndex + 1), value]);
        setHistoryIndex(prev => prev + 1);
      }, 500);
    }
  }, [maxLength, setParentText, historyIndex]);

  const handleSubmit = useCallback(() => {
    if (text.trim() || uploadedImages.length > 0) {
      onSubmit();
    }
  }, [text, uploadedImages, onSubmit]);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'));

    if (imageItems.length > 0) {
      e.preventDefault(); // Prevent default paste behavior for images
      
      const base64Images: string[] = [];
      for (const item of imageItems) {
        const file = item.getAsFile();
        if (file) {
          const base64 = await convertFileToBase64(file);
          base64Images.push(base64);
        }
      }
      
      if (base64Images.length > 0) {
        onImageUpload(base64Images);
      }
    }
  }, [onImageUpload]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
  }, [handleSubmit, onKeyDown]);

  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    
    const base64Images = await Promise.all(files.map(file => convertFileToBase64(file)));
    onImageUpload(base64Images);
    
    // Reset the file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [convertFileToBase64, onImageUpload]);

  const handleFileInputClick = useCallback(() => {
    if (!disabled && !isGenerating) {
      fileInputRef.current?.click();
    }
  }, [disabled, isGenerating]);

  // Memoize token count calculation to prevent recalculation on every render
  const tokenCount = useMemo(() => {
    if (text.length === 0) return 0;
    return estimateTokenCount(text);
  }, [text]);

  function estimateTokenCount(text: string): number {
    if (text.length > 10000) {
      const sampleSize = 5000;
      const firstPart = text.slice(0, sampleSize);
      const lastPart = text.slice(-sampleSize);
      
      const firstPartTokens = Math.ceil(firstPart.length / 4);
      const lastPartTokens = Math.ceil(lastPart.length / 4);
      
      const avgTokenSize = (firstPart.length + lastPart.length) / (firstPartTokens + lastPartTokens);
      const middlePartLength = text.length - (2 * sampleSize);
      const middlePartTokens = Math.ceil(middlePartLength / avgTokenSize);
      
      return firstPartTokens + middlePartTokens + lastPartTokens;
    }
    
    return Math.ceil(text.length / 4);
  }

  const handlePromptSelect = useCallback((content: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const before = text.slice(0, cursorPosition);
    const after = text.slice(cursorPosition);

    const newBefore = before.replace(/\/[^\s]*$/, '');
    setParentText(`${newBefore}${content}${after}`);
    setIsPromptOpen(false);
  }, [text, setParentText]);

  const handleClosePrompt = useCallback(() => {
    setIsPromptOpen(false);
  }, []);

  // Add event listeners for paste
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
  }, [handlePaste]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, []);

  // Memoize button container props
  const buttonProps = useMemo(() => ({
    onCopy: handleCopy,
    text,
    onUploadClick: handleFileInputClick,
    uploadedImages,
    isGenerating,
    onCancel,
    onSubmit: handleSubmit,
    hasText: !!text.trim(),
    hasModel: !!model,
    disabled
  }), [
    handleCopy, 
    text, 
    handleFileInputClick, 
    uploadedImages, 
    isGenerating, 
    onCancel, 
    handleSubmit, 
    model,
    disabled
  ]);

  // Memoize textarea props
  const textareaProps = useMemo(() => ({
    value: text,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    placeholder,
    disabled,
    textareaRef: textareaRef as React.RefObject<HTMLTextAreaElement>
  }), [text, handleChange, handleKeyDown, placeholder, disabled]);

  return (
    <div className="inset-x-0 bg-transparent mx-auto w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
      {isPromptOpen && (
        <PromptCommand
          isOpen={isPromptOpen}
          onClose={handleClosePrompt}
          onSelect={handlePromptSelect}
          searchTerm={promptSearchTerm}
        />
      )}

      <div className="relative border ring-offset-0 border-input w-full py-2 px-3 bg-secondary backdrop-blur-sm ring-0 rounded-xl focus-within:border-primary focus-within:ring-primary focus-within:ring-1">
        <MemoizedTextarea {...textareaProps} />

        <TokenCount count={tokenCount} />
        
        <ButtonContainer {...buttonProps} />

        <UploadedImages 
          images={uploadedImages} 
          onRemove={onRemoveImage}
          disabled={disabled} 
        />

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
  );
}

// Wrap the component with TooltipProvider and memo
const MemoizedDynamicTextarea = memo((props: DynamicTextareaProps) => (
  <TooltipProvider>
    <DynamicTextarea {...props} />
  </TooltipProvider>
));

export default MemoizedDynamicTextarea;
