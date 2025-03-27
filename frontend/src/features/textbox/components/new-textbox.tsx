import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  useLayoutEffect,
  useMemo,
} from 'react';
import { Command, Copy, CornerDownLeft, Database, Paperclip, Send, Sparkle, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PromptCommand } from '@/features/chat/components/prompts/prompt-command';
import { usePrompts } from '@/features/prompts/api/get-prompts';
import { useClipboard } from '@/hooks/use-clipboard';
import { KnowledgeSelector } from '@/features/chat/components/knowledge-selector';
import { KnowledgeChips } from '@/features/chat/components/knowledge';

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
  selectedKnowledgeIds?: string[];
  setSelectedKnowledgeIds?: React.Dispatch<React.SetStateAction<string[]>>;
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
const MemoizedTooltipButton = memo(
  ({
    onClick,
    tooltipText,
    icon,
    className = 'px-2 h-7 w-7 text-xs bg-transparent hover:bg-transparent shadow-none hover:text-foreground text-muted-foreground',
    disabled = false,
  }: TooltipButtonProps) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className={className} onClick={onClick} disabled={disabled}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  )
);

// Memoize the textarea component to prevent re-renders
const MemoizedTextarea = memo(
  ({
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
      className="bg-transparent py-[6px] pr-[50px] focus:outline-none w-full placeholder:text-muted-foreground text-sm transition-all duration-200 resize-none scrollbar-hide"
      style={{
        maxHeight: '200px',
        overflowY: value.split('\n').length > 8 ? 'scroll' : 'hidden',
      }}
      disabled={disabled}
    />
  )
);

// Memoize the token count display to prevent re-renders
const TokenCount = memo(({ count }: { count: number }) => (
  <span className="text-muted-foreground text-xs">
    {count > 0 ? `${count} tokens` : <span className="opacity-0 text-xs">0 tokens</span>}
  </span>
));

// Memoize the button container to prevent re-renders
const ButtonContainer = memo(
  ({
    onCopy,
    text,
    onUploadClick,
    uploadedImages,
    isGenerating,
    onCancel,
    onSubmit,
    hasText,
    hasModel,
    disabled,
    selectedKnowledgeIds,
    setSelectedKnowledgeIds,
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
    selectedKnowledgeIds?: string[];
    setSelectedKnowledgeIds?: React.Dispatch<React.SetStateAction<string[]>>;
  }) => (
    <div className="right-2 bottom-2 absolute flex items-center bg-secondary">
      {!isGenerating && (
        <MemoizedTooltipButton
          onClick={() => onCopy(text)}
          tooltipText="Enhance Prompt"
          icon={<Sparkle className="size-4" />}
          disabled={disabled}
        />
      )}
      {/* {!isGenerating && (
        <MemoizedTooltipButton
          onClick={() => onCopy(text)}
          tooltipText="Copy text"
          icon={<Copy className="size-4" />}
          disabled={disabled}
        />
      )} */}
      {uploadedImages.length === 0 && !isGenerating && (
        <>
          <MemoizedTooltipButton
            onClick={onUploadClick}
            tooltipText="Upload Image (requires vision capable model)"
            icon={<Paperclip className="size-3.5" />}
            disabled={disabled}
          />
        </>
      )}

      {isGenerating ? (
        <Button variant="outline" className="px-2 h-8 text-xs" onClick={onCancel}>
          <X className="mr-1 size-3" />
          Cancel
        </Button>
      ) : (
        <Button
          className="ml-2 px-2 h-8 text-xs whitespace-nowrap"
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
  )
);

// Memoize the uploaded images container to prevent re-renders
const UploadedImages = memo(
  ({
    images,
    onRemove,
    disabled,
  }: {
    images: string[];
    onRemove: (index: number) => void;
    disabled?: boolean;
  }) => {
    if (images.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {images.map((image, index) => (
          <div key={index} className="group relative">
            <img
              src={image}
              alt={`Uploaded ${index + 1}`}
              className="rounded w-12 h-12 object-cover"
            />
            <button
              onClick={() => onRemove(index)}
              className="-top-1.5 -right-1.5 absolute bg-background hover:bg-muted opacity-0 group-hover:opacity-100 p-0.5 border rounded-full transition-all duration-200"
              disabled={disabled}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    );
  }
);

function DynamicTextarea({
  placeholder = 'Message CringeGPT... (use / for prompts, @ for knowledge)',
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
  selectedKnowledgeIds,
  setSelectedKnowledgeIds,
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

  const handleCopy = useCallback(
    (text: string) => {
      copy(text);
    },
    [copy]
  );

  // Use useLayoutEffect for DOM measurements to prevent layout thrashing
  useLayoutEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;

      // Store the current scroll position
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Reset height to auto first to get accurate scrollHeight
      textarea.style.height = 'auto';

      // Calculate new height (capped at maxHeight)
      const newHeight = Math.min(textarea.scrollHeight, 200);

      // Only update height if it's different from current to avoid unnecessary reflows
      if (textarea.clientHeight !== newHeight) {
        textarea.style.height = `${newHeight}px`;
      }

      // Determine if we need scrollbars
      const lineCount = (text.match(/\n/g) || []).length + 1;
      textarea.style.overflowY = lineCount > 8 ? 'scroll' : 'hidden';

      // Restore scroll position
      window.scrollTo(0, scrollTop);
    }
  }, [text]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= maxLength) {
        setParentText(value);

        // Special handling for empty textarea
        if (!value.trim() && textareaRef.current) {
          // Reset to auto height when empty
          textareaRef.current.style.height = 'auto';
        }

        // Debounce history updates to prevent excessive state changes
        if (historyTimeoutRef.current) {
          clearTimeout(historyTimeoutRef.current);
        }

        historyTimeoutRef.current = setTimeout(() => {
          setHistory(prev => [...prev.slice(0, historyIndex + 1), value]);
          setHistoryIndex(prev => prev + 1);
        }, 500);
      }
    },
    [maxLength, setParentText, historyIndex]
  );

  const handleSubmit = useCallback(() => {
    if (text.trim() || uploadedImages.length > 0) {
      onSubmit();
    }
  }, [text, uploadedImages, onSubmit]);

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
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
    },
    [onImageUpload]
  );

  const handleCombinedKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === '/') {
        setIsPromptOpen(true);
        setPromptSearchTerm('');
        return;
      }
      if (event.key === '@') {
        // Let the chat-input component handle the @ character
        // We just need to make sure we don't prevent default behavior
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        handleSubmit();
      } else {
        onKeyDown?.(event);
      }
    },
    [handleSubmit, onKeyDown]
  );

  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      const base64Images = await Promise.all(files.map(file => convertFileToBase64(file)));
      onImageUpload(base64Images);

      // Reset the file input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [convertFileToBase64, onImageUpload]
  );

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

      const avgTokenSize =
        (firstPart.length + lastPart.length) / (firstPartTokens + lastPartTokens);
      const middlePartLength = text.length - 2 * sampleSize;
      const middlePartTokens = Math.ceil(middlePartLength / avgTokenSize);

      return firstPartTokens + middlePartTokens + lastPartTokens;
    }

    return Math.ceil(text.length / 4);
  }

  const handlePromptSelect = useCallback(
    (content: string) => {
      const cursorPosition = textareaRef.current?.selectionStart || 0;
      const before = text.slice(0, cursorPosition);
      const after = text.slice(cursorPosition);

      const newBefore = before.replace(/\/[^\s]*$/, '');
      setParentText(`${newBefore}${content}${after}`);
      setIsPromptOpen(false);
    },
    [text, setParentText]
  );

  const handleClosePrompt = useCallback(() => {
    setIsPromptOpen(false);
  }, []);

  // Add event listeners for paste
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Handle paste events
      textarea.addEventListener('paste', handlePaste);

      // Handle input events (including programmatic changes)
      const handleInput = () => {
        if (textareaRef.current) {
          const textarea = textareaRef.current;

          // Reset height to auto first
          textarea.style.height = 'auto';

          // Calculate new height (capped at maxHeight)
          const newHeight = Math.min(textarea.scrollHeight, 200);

          // Set the new height
          textarea.style.height = `${newHeight}px`;

          // Determine if we need scrollbars
          const lineCount = (textarea.value.match(/\n/g) || []).length + 1;
          textarea.style.overflowY = lineCount > 8 ? 'scroll' : 'hidden';
        }
      };

      // Handle keydown events specifically for delete and backspace
      const handleKeyDown = (e: KeyboardEvent) => {
        // If delete or backspace key is pressed
        if (e.key === 'Delete' || e.key === 'Backspace') {
          // Use requestAnimationFrame to ensure the DOM has updated
          requestAnimationFrame(() => {
            handleInput();
          });
        }
      };

      textarea.addEventListener('input', handleInput);
      textarea.addEventListener('keydown', handleKeyDown);

      // Create a MutationObserver to watch for attribute changes
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
            // If the value attribute changed, update the height
            handleInput();
          }
        });
      });

      // Start observing the textarea for attribute changes
      observer.observe(textarea, { attributes: true });

      return () => {
        textarea.removeEventListener('paste', handlePaste);
        textarea.removeEventListener('input', handleInput);
        textarea.removeEventListener('keydown', handleKeyDown);
        observer.disconnect();
      };
    }

    // Return empty cleanup function if textarea doesn't exist
    return () => {};
  }, [handlePaste]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, []);

  // Add a window resize event listener to ensure the textarea resizes properly
  useEffect(() => {
    const handleResize = () => {
      if (textareaRef.current) {
        const textarea = textareaRef.current;

        // Reset height to auto first
        textarea.style.height = 'auto';

        // Calculate new height (capped at maxHeight)
        const newHeight = Math.min(textarea.scrollHeight, 200);

        // Set the new height
        textarea.style.height = `${newHeight}px`;

        // Determine if we need scrollbars
        const lineCount = (textarea.value.match(/\n/g) || []).length + 1;
        textarea.style.overflowY = lineCount > 8 ? 'scroll' : 'hidden';
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Memoize the textarea props to prevent unnecessary re-renders
  const textareaProps = useMemo(
    () => ({
      value: text,
      onChange: handleChange,
      onKeyDown: handleCombinedKeyDown,
      placeholder,
      disabled,
      textareaRef: textareaRef as React.RefObject<HTMLTextAreaElement>,
    }),
    [text, handleChange, handleCombinedKeyDown, placeholder, disabled]
  );

  // Memoize the button props to prevent unnecessary re-renders
  const buttonProps = useMemo(
    () => ({
      onCopy: handleCopy,
      text,
      onUploadClick: handleFileInputClick,
      uploadedImages,
      isGenerating,
      onCancel,
      onSubmit: handleSubmit,
      hasText: !!text.trim(),
      hasModel: !!model,
      disabled,
      selectedKnowledgeIds,
      setSelectedKnowledgeIds,
    }),
    [
      handleCopy,
      text,
      handleFileInputClick,
      uploadedImages,
      isGenerating,
      onCancel,
      handleSubmit,
      model,
      disabled,
      selectedKnowledgeIds,
      setSelectedKnowledgeIds,
    ]
  );

  // Add a handler for removing knowledge items
  const handleRemoveKnowledge = useCallback(
    (id: string) => {
      if (setSelectedKnowledgeIds) {
        setSelectedKnowledgeIds(prev => prev.filter(knowledgeId => knowledgeId !== id));
      }
    },
    [setSelectedKnowledgeIds]
  );

  return (
    <div className="inset-x-0 bg-transparent mx-auto w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
      {isPromptOpen && (
        <PromptCommand
          isOpen={isPromptOpen}
          searchTerm={promptSearchTerm}
          onSelect={handlePromptSelect}
          onClose={() => setIsPromptOpen(false)}
        />
      )}

      <div className="relative bg-secondary backdrop-blur-sm px-3 py-2 border border-input focus-within:border-primary rounded-xl ring-0 focus-within:ring-primary focus-within:ring-1 ring-offset-0 w-full">
        {/* Display knowledge chips above the textarea */}
        {selectedKnowledgeIds && selectedKnowledgeIds.length > 0 && (
          <KnowledgeChips
            selectedKnowledgeIds={selectedKnowledgeIds}
            onRemove={handleRemoveKnowledge}
            disabled={disabled || isGenerating}
          />
        )}

        <MemoizedTextarea {...textareaProps} />

        <TokenCount count={tokenCount} />

        <ButtonContainer {...buttonProps} />

        <UploadedImages images={uploadedImages} onRemove={onRemoveImage} disabled={disabled} />

        {/* Hidden file input for image uploads */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
          disabled={disabled || isGenerating}
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
