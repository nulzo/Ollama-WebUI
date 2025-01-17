import { create } from 'zustand';

interface StreamingState {
  isStreaming: boolean;
  pendingContent: string;
  displayedContent: string;
  setIsStreaming: (isStreaming: boolean) => void;
  appendContent: (content: string) => void;
  setDisplayedContent: (content: string) => void;
  reset: () => void;
}

export const useStreamingStore = create<StreamingState>((set) => ({
  isStreaming: false,
  pendingContent: '',
  displayedContent: '',
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  appendContent: (content) => set((state) => ({ 
    pendingContent: state.pendingContent + content 
  })),
  setDisplayedContent: (content) => set({ displayedContent: content }),
  reset: () => set({ 
    isStreaming: false, 
    pendingContent: '', 
    displayedContent: '' 
  })
}));