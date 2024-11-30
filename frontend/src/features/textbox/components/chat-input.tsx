import { useState } from 'react';
import AutoResizeTextarea from '@/features/textbox/components/new-textbox';
import { useModelStore } from '@/features/models/store/model-store';

interface ChatInputProps {
  onSubmit: (message: string, images: string[]) => void;
}

export function ChatInput({ onSubmit }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const { model } = useModelStore(state => ({ model: state.model }));

  const handleSubmit = () => {
    onSubmit(message, images);
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
    <div className="relative pt-1 pb-4 transition w-full">
      <AutoResizeTextarea
        text={message}
        setText={setMessage}
        onSubmit={handleSubmit}
        model={model?.name || ''}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        uploadedImages={images}
      />
      <div className="flex justify-center gap-1 mt-1 pb-1 w-full text-center text-muted-foreground text-xs">
        CringeGPT <span className="italic">never</span> makes mistakes.
      </div>
    </div>
  );
}