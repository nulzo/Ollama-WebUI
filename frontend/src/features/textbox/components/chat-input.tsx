import { useState, useEffect, useMemo } from 'react';
import { mockPrompts, CustomPrompt } from '@/features/chat/data/mock-prompts';
import { PromptSuggestions } from '@/features/chat/components/prompts/prompt-suggestions';
import AutoResizeTextarea from './new-textbox';
import { useModelStore } from '@/features/models/store/model-store';
import { useChatMutation } from '@/features/chat/hooks/use-chat-mutation';

interface ChatInputProps {
  onSubmit: (message: string, images: string[]) => void;
  disabled?: boolean;
  messages?: { content: string; role: 'user' | 'assistant' }[];
}

export function ChatInput({ onSubmit, disabled, messages = [] }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<CustomPrompt[]>([]);
  const [promptIndex, setPromptIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { model } = useModelStore(state => ({ model: state.model }));
  const { handleCancel, isGenerating } = useChatMutation();
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(-1);


  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  useEffect(() => {
    const match = message.match(/\/(\w*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      const filtered = mockPrompts.filter((prompt) => 
        prompt.title.toLowerCase().includes(query) || 
        prompt.command.toLowerCase().includes(query)
      );
      setSuggestions(filtered);
      setPromptIndex(message.lastIndexOf('/'));
    } else {
      setSuggestions([]);
      setPromptIndex(-1);
    }
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
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

  const handlePromptSelect = (prompt: CustomPrompt) => {
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

  const userMessages = useMemo(() => 
    messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .reverse(),
    [messages]
  );

  const handleImageUpload = (base64Images: string[]) => {
    setImages(prev => [...prev, ...base64Images]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMessageNavigate = (index: number) => {
    if (index >= 0 && index < messageHistory.length) {
      setCurrentMessageIndex(index);
      setMessage(messageHistory[index]);
    }
  };

  return (
    <div className="relative w-full transition">
      {suggestions.length > 0 && (
          <div className="mx-auto w-full md:max-w-2xl lg:max-w-3xl xl:max-w-5xl 2xl:max-w-7xl">
            <PromptSuggestions
              isOpen={suggestions.length > 0}
              onClose={() => setSuggestions([])}
              onSelect={handlePromptSelect}
              searchTerm={message.slice(promptIndex + 1)}
              prompts={suggestions}
              selectedIndex={selectedIndex}
              messageHistory={userMessages}
              currentMessageIndex={currentMessageIndex}
              onMessageNavigate={handleMessageNavigate}
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