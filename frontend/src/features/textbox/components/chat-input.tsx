import { useState, useEffect } from 'react';
import { Prompt } from '@/features/prompts/prompt';
import { PromptSuggestions } from '@/features/chat/components/prompts/prompt-suggestions';
import AutoResizeTextarea from './new-textbox';
import { useModelStore } from '@/features/models/store/model-store';
import { useChatMutation } from '@/features/chat/hooks/use-chat-mutation';
import { usePrompts } from '@/features/prompts/api/get-prompts';

interface ChatInputProps {
  onSubmit: (message: string, images: string[]) => void;
  disabled?: boolean;
  messages?: { content: string; role: 'user' | 'assistant' }[];
}

export function ChatInput({ onSubmit, disabled, messages = [] }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Prompt[]>([]);
  const [promptIndex, setPromptIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { model } = useModelStore(state => ({ model: state.model }));
  const { handleCancel, isGenerating } = useChatMutation();
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);
  const { data } = usePrompts();

  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  useEffect(() => {
    const match = message.match(/\/(\w*)$/);
    if (match && data?.data) {
      const query = match[1].toLowerCase();
      const filtered = data.data.filter(
        (prompt: Prompt) =>
          prompt.title.toLowerCase().includes(query) ||
          (prompt.command || '').toLowerCase().includes(query)
      );

      // Only show suggestions if we have matches or if there's text after the slash
      if (filtered.length > 0 || query.length > 0) {
        setSuggestions(filtered);
        setPromptIndex(message.lastIndexOf('/'));
      } else {
        setSuggestions([]);
        setPromptIndex(-1);
      }
    } else {
      // Close suggestions when no slash command is present
      setSuggestions([]);
      setPromptIndex(-1);
    }
  }, [message, data]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  };

  const handlePromptSelect = (prompt: Prompt) => {
    if (promptIndex === -1) return;

    const before = message.slice(0, promptIndex);
    const after = message.slice(message.indexOf(' ', promptIndex) + 1 || message.length);
    const newText = `${before}${prompt.content}${after}`;
    setMessage(newText);
    setSuggestions([]);
  };

  const handleSubmit = () => {
    if (!message.trim() && images.length === 0) return;
    onSubmit(message, images);
    setMessageHistory(prev => [...prev, message]);
    setCurrentMessageIndex(prev => prev + 1);
    setMessage('');
    setImages([]);
  };

  const handleImageUpload = (base64Images: string[]) => {
    setImages(prev => [...prev, ...base64Images]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative w-full transition">
      {suggestions.length > 0 && (
        <div className="mx-auto w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl">
          <PromptSuggestions
            isOpen={suggestions.length > 0}
            onClose={() => setSuggestions([])}
            onSelect={handlePromptSelect}
            searchTerm={message.slice(promptIndex + 1)}
            prompts={suggestions}
            selectedIndex={selectedIndex}
          />
        </div>
      )}
      <AutoResizeTextarea
        text={message}
        setText={setMessage}
        onSubmit={handleSubmit}
        model={model?.name || ''}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        uploadedImages={images}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onCancel={handleCancel}
        isGenerating={isGenerating}
      />
    </div>
  );
}
