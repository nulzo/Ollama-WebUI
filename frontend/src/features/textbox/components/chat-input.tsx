import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { Prompt } from '@/features/prompts/prompt';
import { PromptSuggestions } from '@/features/chat/components/prompts/prompt-suggestions';
import AutoResizeTextarea from './new-textbox';
import { useModelStore } from '@/features/models/store/model-store';
import { useChatMutation } from '@/features/chat/hooks/use-chat-mutation';
import { usePrompts } from '@/features/prompts/api/get-prompts';
import { useConversation } from '@/features/chat/hooks/use-conversation';
import { useChatStore } from '@/features/chat/stores/chat-store';

interface ChatInputProps {
  onSubmit: (message: string, images: string[]) => void;
  disabled?: boolean;
  messages?: { content: string; role: 'user' | 'assistant' }[];
  placeholder?: string;
  onCancel?: () => void;
  isGenerating?: boolean;
}

// Define interface for the MemoizedTextarea component props
interface TextareaProps {
  text: string;
  setText: (text: string) => void;
  onSubmit: () => void;
  model: string;
  onImageUpload: (images: string[]) => void;
  onRemoveImage: (index: number) => void;
  uploadedImages: string[];
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onCancel: () => void;
  isGenerating?: boolean;
  placeholder?: string;
}

// Define interface for the MemoizedPromptSuggestions component props
interface PromptSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (prompt: Prompt) => void;
  searchTerm: string;
  selectedIndex: number;
}

// Memoize the AutoResizeTextarea wrapper to prevent unnecessary re-renders
const MemoizedTextarea = memo(({ 
  text, 
  setText, 
  onSubmit, 
  model, 
  onImageUpload, 
  onRemoveImage, 
  uploadedImages, 
  disabled, 
  onKeyDown, 
  onCancel, 
  isGenerating,
  placeholder
}: TextareaProps) => (
  <AutoResizeTextarea
    text={text}
    setText={setText}
    onSubmit={onSubmit}
    model={model}
    onImageUpload={onImageUpload}
    onRemoveImage={onRemoveImage}
    uploadedImages={uploadedImages}
    disabled={disabled}
    onKeyDown={onKeyDown}
    onCancel={onCancel}
    isGenerating={isGenerating}
    placeholder={placeholder}
  />
));

// Memoize the PromptSuggestions wrapper to prevent unnecessary re-renders
const MemoizedPromptSuggestions = memo(({
  isOpen,
  onClose,
  onSelect,
  searchTerm,
  selectedIndex
}: PromptSuggestionsProps) => (
  <PromptSuggestions
    isOpen={isOpen}
    onClose={onClose}
    onSelect={onSelect}
    searchTerm={searchTerm}
    selectedIndex={selectedIndex}
  />
));

// Create a component for the suggestions container to prevent re-renders
const SuggestionsContainer = memo(({ 
  isOpen, 
  onClose, 
  onSelect, 
  searchTerm, 
  selectedIndex 
}: PromptSuggestionsProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="mx-auto w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl">
      <MemoizedPromptSuggestions
        isOpen={isOpen}
        onClose={onClose}
        onSelect={onSelect}
        searchTerm={searchTerm}
        selectedIndex={selectedIndex}
      />
    </div>
  );
});

// Create a stable message setter that doesn't change on re-renders
const useStableMessageSetter = (setMessage: React.Dispatch<React.SetStateAction<string>>) => {
  const setMessageRef = useRef(setMessage);
  
  useEffect(() => {
    setMessageRef.current = setMessage;
  }, [setMessage]);
  
  return useCallback((value: string) => {
    setMessageRef.current(value);
  }, []);
};

// Create a stable selector for the model store to prevent infinite loops
const modelSelector = (state: { model: any }) => state.model;

// Rename to ChatInputBase to avoid naming conflicts
const ChatInputBase = ({ 
  onSubmit, 
  disabled, 
  messages = [], 
  placeholder = "Message CringeGPT...",
  onCancel,
  isGenerating: externalIsGenerating
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Prompt[]>([]);
  const [promptIndex, setPromptIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Use the stable selector to prevent infinite loops
  const model = useModelStore(modelSelector);
  
  // Get the current conversation ID
  const { conversation } = useConversation();
  
  // Use external isGenerating if provided, otherwise get from store
  const storeIsGenerating = useChatStore(state => state.isGenerating);
  const isGenerating = externalIsGenerating !== undefined ? externalIsGenerating : storeIsGenerating;
  
  // Get the mutation with the conversation ID if we need to handle cancel internally
  const mutation = useChatMutation(conversation || undefined);
  
  // Use external onCancel if provided, otherwise use mutation.handleCancel
  const handleCancel = useCallback(() => {
    console.log('Cancelling generation from chat input');
    if (onCancel) {
      onCancel();
    } else {
      mutation.handleCancel();
    }
  }, [onCancel, mutation]);
  
  const filterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stableSetMessage = useStableMessageSetter(setMessage);
  
  const { data } = usePrompts();

  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Log isGenerating changes for debugging
  useEffect(() => {
    console.log('isGenerating state changed:', isGenerating);
  }, [isGenerating]);

  // Memoize the prompt data to avoid unnecessary re-filtering
  const promptsData = useMemo(() => data?.data || [], [data?.data]);

  // Debounced filter function
  const debouncedFilterPrompts = useCallback((searchText: string) => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    filterTimeoutRef.current = setTimeout(() => {
      const match = searchText.match(/\/(\w*)$/);
      if (match && promptsData.length > 0) {
        const query = match[1].toLowerCase();
        const filtered = promptsData.filter(
          (prompt: Prompt) =>
            prompt.title.toLowerCase().includes(query) ||
            (prompt.command || '').toLowerCase().includes(query)
        );

        // Only show suggestions if we have matches or if there's text after the slash
        if (filtered.length > 0 || query.length > 0) {
          setSuggestions(filtered);
          setPromptIndex(searchText.lastIndexOf('/'));
        } else {
          setSuggestions([]);
          setPromptIndex(-1);
        }
      } else {
        // Close suggestions when no slash command is present
        setSuggestions([]);
        setPromptIndex(-1);
      }
    }, 150); // 150ms debounce delay
  }, [promptsData]);

  // Replace the original useEffect with the debounced version
  useEffect(() => {
    debouncedFilterPrompts(message);
    
    // Cleanup function
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [message, debouncedFilterPrompts]);

  const handlePromptSelect = useCallback((prompt: Prompt) => {
    if (promptIndex === -1) return;

    const before = message.slice(0, promptIndex);
    const after = message.slice(message.indexOf(' ', promptIndex) + 1 || message.length);
    const newText = `${before}${prompt.content}${after}`;
    stableSetMessage(newText);
    setSuggestions([]);
  }, [message, promptIndex, stableSetMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'Enter':
        if (!e.ctrlKey && !e.metaKey && suggestions.length > 0) {
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            handlePromptSelect(suggestions[selectedIndex]);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSuggestions([]);
        break;
    }
  }, [suggestions, selectedIndex, handlePromptSelect]);

  const handleSubmit = useCallback(() => {
    if (!message.trim() && images.length === 0) return;
    onSubmit(message, images);
    setMessage('');
    setImages([]);
  }, [message, images, onSubmit]);

  const handleImageUpload = useCallback((base64Images: string[]) => {
    setImages(prev => [...prev, ...base64Images]);
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const closeSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  // Memoize the search term to avoid recalculating it on every render
  const searchTerm = useMemo(() => 
    promptIndex >= 0 ? message.slice(promptIndex + 1) : '', 
    [message, promptIndex]
  );

  // Memoize whether suggestions are open to avoid recalculating it on every render
  const isSuggestionsOpen = useMemo(() => 
    suggestions.length > 0, 
    [suggestions.length]
  );

  // Cache the model name to prevent re-renders
  const modelName = useMemo(() => model?.name || '', [model]);

  // Memoize the textarea props to prevent unnecessary re-renders
  const textareaProps = useMemo(() => ({
    text: message,
    setText: stableSetMessage,
    onSubmit: handleSubmit,
    model: modelName,
    onImageUpload: handleImageUpload,
    onRemoveImage: handleRemoveImage,
    uploadedImages: images,
    disabled,
    onKeyDown: handleKeyDown,
    onCancel: handleCancel,
    isGenerating,
    placeholder
  }), [
    message, 
    stableSetMessage, 
    handleSubmit, 
    modelName, 
    handleImageUpload, 
    handleRemoveImage, 
    images, 
    disabled, 
    handleKeyDown, 
    handleCancel, 
    isGenerating,
    placeholder
  ]);

  // Memoize the suggestions props to prevent unnecessary re-renders
  const suggestionsProps = useMemo(() => ({
    isOpen: isSuggestionsOpen,
    onClose: closeSuggestions,
    onSelect: handlePromptSelect,
    searchTerm,
    selectedIndex
  }), [
    isSuggestionsOpen,
    closeSuggestions,
    handlePromptSelect,
    searchTerm,
    selectedIndex
  ]);

  return (
    <div className="relative w-full transition">
      <SuggestionsContainer {...suggestionsProps} />
      <MemoizedTextarea {...textareaProps} />
    </div>
  );
};

// Export a memoized version of the component
export const ChatInput = memo(ChatInputBase);
