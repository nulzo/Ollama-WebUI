import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AutoResizeTextarea from '@/features/textbox/components/new-textbox';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  position?: 'center' | 'bottom';
  placeholder?: string;
  onImageUpload?: (images: string[]) => void;
  onRemoveImage?: (index: number) => void;
  uploadedImages?: string[];
}

export function ChatInput({ 
  input, 
  setInput, 
  onSubmit, 
  isGenerating, 
  position = 'bottom',
  placeholder = 'Send a message...',
  onImageUpload = () => {},
  onRemoveImage = () => {},
  uploadedImages = []
}: ChatInputProps) {
  // Focus the textarea when the component mounts or when generation completes
  useEffect(() => {
    if (!isGenerating) {
      // Use a small delay to ensure the DOM has updated
      const timer = setTimeout(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isGenerating]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isGenerating) {
        onSubmit();
      }
    }
  };
  
  // Add global keyboard listener for / shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // Handle image upload
  const handleImageUpload = (images: string[]) => {
    if (onImageUpload) {
      onImageUpload(images);
    }
  };

  // Handle image removal
  const handleImageRemove = (index: number) => {
    if (onRemoveImage) {
      onRemoveImage(index);
    }
  };

  return (
    <motion.div
      layout
      layoutId="chat-input"
      className={`
        w-full max-w-2xl mx-auto px-4
        ${position === 'center' ? 'py-6' : 'sticky bottom-0 py-4 bg-background/80 backdrop-blur-sm border-t'}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex items-end">
        <div className="w-full pr-12"> {/* Container with padding for the send button */}
          <AutoResizeTextarea
            text={input}
            setText={setInput}
            onSubmit={onSubmit}
            model="default"
            onImageUpload={handleImageUpload}
            onRemoveImage={handleImageRemove}
            uploadedImages={uploadedImages}
            placeholder={placeholder}
            onCancel={() => {}}
            isGenerating={isGenerating}
            onKeyDown={handleKeyDown}
          />
        </div>
        
        <div className="absolute right-3 bottom-3">
          {isGenerating ? (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full" 
              disabled
            >
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" 
              onClick={onSubmit}
              disabled={!input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground text-center">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {position === 'bottom' && <span className="mx-2">•</span>}
        {position === 'bottom' && <span>Press / to focus</span>}
      </div>
    </motion.div>
  );
}