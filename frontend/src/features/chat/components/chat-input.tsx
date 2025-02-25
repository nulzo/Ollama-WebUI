import { motion } from 'framer-motion';
import AutoResizeTextarea from '@/features/textbox/components/new-textbox';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  position?: 'center' | 'bottom';
}

export function ChatInput({ input, setInput, onSubmit, isGenerating, position = 'bottom' }: ChatInputProps) {
  return (
    <motion.div
      layout
      layoutId="chat-input"
      className={`
        w-full max-w-2xl mx-auto
        ${position === 'center' ? '' : 'sticky bottom-0 py-4 bg-background border-t'}
      `}
    >
      <AutoResizeTextarea
        text={input}
        setText={setInput}
        onSubmit={onSubmit}
        model="default"
        onImageUpload={() => {}}
        onRemoveImage={() => {}}
        uploadedImages={[]}
        placeholder="Send a message..."
        onCancel={() => {}}
        isGenerating={isGenerating}
      />
    </motion.div>
  );
}