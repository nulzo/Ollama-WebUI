import { useState } from 'react';
import AutoResizeTextarea from '@/features/textbox/components/new-textbox';
import { useModelStore } from '@/features/models/store/model-store';

interface ChatInputProps {
  onSubmit: (message: string, image: string | null) => void;
}

export function ChatInput({ onSubmit }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const { model } = useModelStore(state => ({ model: state.model }));

  const handleSubmit = () => {
    onSubmit(message, image);
    setMessage('');
    setImage(null);
  };

  const handleImageUpload = (base64Image: string | null) => {
    setImage(base64Image);
  };

  return (
    <div className="pb-4 pt-4 transition backdrop-blur">
      <AutoResizeTextarea
        text={message}
        setText={setMessage}
        onSubmit={handleSubmit}
        model={model?.name || ''}
        onImageUpload={handleImageUpload}
        uploadedImage={image}
      />
      <div className="text-xs gap-1 text-muted-foreground mt-1 pb-1 flex w-full text-center justify-center">
        CringeGPT <span className="italic">never</span> makes mistakes.
      </div>
    </div>
  );
}