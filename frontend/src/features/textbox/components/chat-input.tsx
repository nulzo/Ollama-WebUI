import { useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { Prompt } from '@/features/prompts/prompt';
import { PromptSuggestions } from '@/features/chat/components/prompts/prompt-suggestions';
import { KnowledgeSuggestions } from '@/features/chat/components/knowledge';
import { Knowledge } from '@/features/knowledge/knowledge';
import AutoResizeTextarea from './new-textbox';
import { useModelStore } from '@/features/models/store/model-store';
import { useChatMutation } from '@/features/chat/hooks/use-chat-mutation';
import { usePrompts } from '@/features/prompts/api/get-prompts';
import { useConversation } from '@/features/chat/hooks/use-conversation';
import { useChatStore } from '@/features/chat/stores/chat-store';
import { KnowledgeSelector } from '@/features/chat/components/knowledge-selector';
import { useChatInputState } from '../hooks/use-chat-input-state';

export interface ChatInputProps {
  onSubmit: (message: string, images?: string[], knowledgeIds?: string[], functionCall?: boolean) => void;
  disabled?: boolean;
  messages?: any[];
  placeholder?: string;
  onCancel?: () => void;
  functionCall?: boolean;
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
  selectedKnowledgeIds: string[];
  setSelectedKnowledgeIds: React.Dispatch<React.SetStateAction<string[]>>;
}

// Define interface for the MemoizedPromptSuggestions component props
interface PromptSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (prompt: Prompt) => void;
  searchTerm: string;
  selectedIndex: number;
}

// Define interface for the MemoizedKnowledgeSuggestions component props
interface KnowledgeSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (knowledge: Knowledge) => void;
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
  placeholder,
  selectedKnowledgeIds,
  setSelectedKnowledgeIds
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
    selectedKnowledgeIds={selectedKnowledgeIds}
    setSelectedKnowledgeIds={setSelectedKnowledgeIds}
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

// Memoize the KnowledgeSuggestions wrapper to prevent unnecessary re-renders
const MemoizedKnowledgeSuggestions = memo(({
  isOpen,
  onClose,
  onSelect,
  searchTerm,
  selectedIndex
}: KnowledgeSuggestionsProps) => (
  <KnowledgeSuggestions
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

// Create a component for the knowledge suggestions container to prevent re-renders
const KnowledgeSuggestionsContainer = memo(({ 
  isOpen, 
  onClose, 
  onSelect, 
  searchTerm, 
  selectedIndex 
}: KnowledgeSuggestionsProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="mx-auto w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl">
      <MemoizedKnowledgeSuggestions
        isOpen={isOpen}
        onClose={onClose}
        onSelect={onSelect}
        searchTerm={searchTerm}
        selectedIndex={selectedIndex}
      />
    </div>
  );
});

// Create a stable selector for the model store to prevent infinite loops
const modelSelector = (state: { model: any }) => state.model;

// Rename to ChatInputBase to avoid naming conflicts
export const ChatInputBase = ({ 
  onSubmit, 
  disabled = false, 
  messages = [], 
  placeholder = 'Send a message (use / for prompts, @ for knowledge)',
  onCancel,
  functionCall = false,
}: ChatInputProps) => {
  const [state, dispatch] = useChatInputState();
  const {
    message,
    images,
    suggestions,
    promptIndex,
    selectedIndex,
    selectedKnowledgeIds,
    knowledgeSuggestions,
    knowledgeIndex,
    knowledgeSelectedIndex,
  } = state;

  const model = useModelStore(modelSelector);
  const { conversation } = useConversation();
  const status = useChatStore(state => state.status);
  const isGenerating = status === 'generating' || status === 'waiting';
  const { handleCancel: cancelMutation } = useChatMutation(conversation || undefined);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      cancelMutation();
    }
  }, [onCancel, cancelMutation]);

  const filterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data } = usePrompts();
  const promptsData = useMemo(() => data?.data || [], [data?.data]);

  const debouncedFilterSuggestions = useCallback((searchText: string) => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    filterTimeoutRef.current = setTimeout(() => {
      // Check for prompt suggestions (/)
      const promptMatch = searchText.match(/\/(\w*)$/);
      if (promptMatch && promptsData.length > 0) {
        const query = promptMatch[1].toLowerCase();
        const filtered = promptsData.filter(
          (prompt: Prompt) =>
            prompt.title.toLowerCase().includes(query) ||
            (prompt.command || '').toLowerCase().includes(query)
        );

        // Only show suggestions if we have matches or if there's text after the slash
        if (filtered.length > 0 || query.length > 0) {
          dispatch({ type: 'SET_SUGGESTIONS', payload: filtered });
          dispatch({ type: 'SET_PROMPT_INDEX', payload: searchText.lastIndexOf('/') });
          // Close knowledge suggestions when showing prompt suggestions
          dispatch({ type: 'SET_KNOWLEDGE_SUGGESTIONS', payload: [] });
          dispatch({ type: 'SET_KNOWLEDGE_INDEX', payload: -1 });
        } else {
          dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
          dispatch({ type: 'SET_PROMPT_INDEX', payload: -1 });
        }
      } else {
        // Close prompt suggestions when no slash command is present
        dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
        dispatch({ type: 'SET_PROMPT_INDEX', payload: -1 });
        
        // Check for knowledge suggestions (@)
        const knowledgeMatch = searchText.match(/@(\w*)$/);
        if (knowledgeMatch) {
          const query = knowledgeMatch[1].toLowerCase();
          // We'll fetch and filter knowledge items in the KnowledgeSuggestions component
          // Just set the index here
          dispatch({ type: 'SET_KNOWLEDGE_INDEX', payload: searchText.lastIndexOf('@') });
          dispatch({ type: 'SET_KNOWLEDGE_SUGGESTIONS', payload: [{}] as any }); // Just a placeholder to trigger the component
        } else {
          // Close knowledge suggestions when no @ is present
          dispatch({ type: 'SET_KNOWLEDGE_SUGGESTIONS', payload: [] });
          dispatch({ type: 'SET_KNOWLEDGE_INDEX', payload: -1 });
        }
      }
    }, 150); // 150ms debounce delay
  }, [promptsData, dispatch]);

  useEffect(() => {
    debouncedFilterSuggestions(message);
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [message, debouncedFilterSuggestions]);

  const handlePromptSelect = useCallback((prompt: Prompt) => {
    if (promptIndex === -1) return;

    const before = message.slice(0, promptIndex);
    const after = message.slice(message.indexOf(' ', promptIndex) + 1 || message.length);
    const newText = `${before}${prompt.content}${after}`;
    dispatch({ type: 'SET_MESSAGE', payload: newText });
    dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
  }, [message, promptIndex, dispatch]);

  const handleKnowledgeSelect = useCallback((knowledge: Knowledge) => {
    if (knowledgeIndex === -1) return;

    // Add the knowledge ID to the selected knowledge IDs
    if (!selectedKnowledgeIds.includes(knowledge.id)) {
      dispatch({ type: 'ADD_KNOWLEDGE_ID', payload: knowledge.id });
    }

    // Replace the @query with the knowledge name
    const before = message.slice(0, knowledgeIndex);
    const after = message.slice(message.indexOf(' ', knowledgeIndex) + 1 || message.length);
    const newText = `${before}${after}`;
    dispatch({ type: 'SET_MESSAGE', payload: newText });
    dispatch({ type: 'SET_KNOWLEDGE_SUGGESTIONS', payload: [] });
  }, [message, knowledgeIndex, selectedKnowledgeIds, dispatch]);

  // Add a handler for removing knowledge items
  const handleRemoveKnowledge = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_KNOWLEDGE_ID', payload: id });
  }, [dispatch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          dispatch({ type: 'SET_SELECTED_INDEX', payload: selectedIndex > 0 ? selectedIndex - 1 : suggestions.length - 1 });
          break;
        case 'ArrowDown':
          e.preventDefault();
          dispatch({ type: 'SET_SELECTED_INDEX', payload: selectedIndex < suggestions.length - 1 ? selectedIndex + 1 : 0 });
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
          dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
          break;
      }
      return;
    }
    
    // Handle knowledge suggestions
    if (knowledgeSuggestions.length > 0) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          dispatch({ type: 'SET_KNOWLEDGE_SELECTED_INDEX', payload: knowledgeSelectedIndex > 0 ? knowledgeSelectedIndex - 1 : knowledgeSuggestions.length - 1 });
          break;
        case 'ArrowDown':
          e.preventDefault();
          dispatch({ type: 'SET_KNOWLEDGE_SELECTED_INDEX', payload: knowledgeSelectedIndex < knowledgeSuggestions.length - 1 ? knowledgeSelectedIndex + 1 : 0 });
          break;
        case 'Enter':
          if (!e.ctrlKey && !e.metaKey && knowledgeSuggestions.length > 0) {
            e.preventDefault();
            if (knowledgeSuggestions[knowledgeSelectedIndex]) {
              handleKnowledgeSelect(knowledgeSuggestions[knowledgeSelectedIndex]);
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          dispatch({ type: 'SET_KNOWLEDGE_SUGGESTIONS', payload: [] });
          break;
      }
    }
  }, [
    suggestions,
    selectedIndex,
    handlePromptSelect,
    knowledgeSuggestions,
    knowledgeSelectedIndex,
    handleKnowledgeSelect,
    dispatch,
  ]);

  const closeSuggestions = useCallback(() => {
    dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
    dispatch({ type: 'SET_KNOWLEDGE_SUGGESTIONS', payload: [] });
  }, [dispatch]);

  const handleSubmitMessage = useCallback(() => {
    if (!message.trim() && images.length === 0) return;
    
    // Log the selected knowledge IDs for debugging
    if (selectedKnowledgeIds.length > 0) {
      console.log('Submitting message with knowledge IDs:', selectedKnowledgeIds);
    }
    
    // Log function call status for debugging
    console.log('Submitting message with function call enabled:', functionCall);
    
    // Pass functionCall parameter to onSubmit
    onSubmit(message, images, selectedKnowledgeIds, functionCall);
    
    // Reset state
    dispatch({ type: 'RESET' });
  }, [message, images, onSubmit, selectedKnowledgeIds, functionCall, dispatch]);

  const handleImageUpload = useCallback((base64Images: string[]) => {
    base64Images.forEach(img => dispatch({ type: 'ADD_IMAGE', payload: img }));
  }, [dispatch]);

  const handleRemoveImage = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_IMAGE', payload: index });
  }, [dispatch]);

  // Memoize the search term for prompts to avoid recalculating it on every render
  const promptSearchTerm = useMemo(() => 
    promptIndex >= 0 ? message.slice(promptIndex + 1) : '', 
    [message, promptIndex]
  );

  // Memoize the search term for knowledge to avoid recalculating it on every render
  const knowledgeSearchTerm = useMemo(() => 
    knowledgeIndex >= 0 ? message.slice(knowledgeIndex + 1) : '', 
    [message, knowledgeIndex]
  );

  // Memoize whether suggestions are open to avoid recalculating it on every render
  const isPromptSuggestionsOpen = useMemo(() => 
    suggestions.length > 0, 
    [suggestions.length]
  );

  // Memoize whether knowledge suggestions are open to avoid recalculating it on every render
  const isKnowledgeSuggestionsOpen = useMemo(() => 
    knowledgeSuggestions.length > 0, 
    [knowledgeSuggestions.length]
  );

  // Cache the model name to prevent re-renders
  const modelName = useMemo(() => model?.name || '', [model]);

  // Memoize the textarea props to prevent unnecessary re-renders
  const textareaProps = useMemo(() => ({
    text: message,
    setText: (text: string) => dispatch({ type: 'SET_MESSAGE', payload: text }),
    onSubmit: handleSubmitMessage,
    model: modelName,
    onImageUpload: handleImageUpload,
    onRemoveImage: handleRemoveImage,
    uploadedImages: images,
    disabled,
    onKeyDown: handleKeyDown,
    onCancel: handleCancel,
    isGenerating,
    placeholder,
    selectedKnowledgeIds,
    setSelectedKnowledgeIds: (value: React.SetStateAction<string[]>) => {
      if (typeof value === 'function') {
        dispatch({ type: 'SET_SELECTED_KNOWLEDGE_IDS', payload: value(selectedKnowledgeIds) });
      } else {
        dispatch({ type: 'SET_SELECTED_KNOWLEDGE_IDS', payload: value });
      }
    },
  }), [
    message, 
    dispatch, 
    handleSubmitMessage, 
    modelName, 
    handleImageUpload, 
    handleRemoveImage, 
    images, 
    disabled, 
    handleKeyDown, 
    handleCancel, 
    isGenerating,
    placeholder,
    selectedKnowledgeIds
  ]);

  // Memoize the prompt suggestions props to prevent unnecessary re-renders
  const promptSuggestionsProps = useMemo(() => ({
    isOpen: isPromptSuggestionsOpen,
    onClose: closeSuggestions,
    onSelect: handlePromptSelect,
    searchTerm: promptSearchTerm,
    selectedIndex
  }), [
    isPromptSuggestionsOpen,
    closeSuggestions,
    handlePromptSelect,
    promptSearchTerm,
    selectedIndex
  ]);

  // Memoize the knowledge suggestions props to prevent unnecessary re-renders
  const knowledgeSuggestionsProps = useMemo(() => ({
    isOpen: isKnowledgeSuggestionsOpen,
    onClose: closeSuggestions,
    onSelect: handleKnowledgeSelect,
    searchTerm: knowledgeSearchTerm,
    selectedIndex: knowledgeSelectedIndex
  }), [
    isKnowledgeSuggestionsOpen,
    closeSuggestions,
    handleKnowledgeSelect,
    knowledgeSearchTerm,
    knowledgeSelectedIndex
  ]);

  return (
    <div className="relative w-full transition">
      <SuggestionsContainer {...promptSuggestionsProps} />
      <KnowledgeSuggestionsContainer {...knowledgeSuggestionsProps} />
      <MemoizedTextarea {...textareaProps} />
    </div>
  );
};

// Export a memoized version of the component
export const ChatInput = memo(ChatInputBase);
