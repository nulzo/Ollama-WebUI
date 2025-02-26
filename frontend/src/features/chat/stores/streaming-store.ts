import { create } from 'zustand';

export interface StreamingState {
  isStreaming: boolean;
  pendingContent: string;
  displayedContent: string;
  streamingMessageId: string | null;
  error: string | null;
  setIsStreaming: (isStreaming: boolean) => void;
  appendContent: (content: string) => void;
  setDisplayedContent: (content: string) => void;
  setStreamingMessageId: (id: string | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useStreamingStore = create<StreamingState>((set) => ({
  isStreaming: false,
  pendingContent: '',
  displayedContent: '',
  streamingMessageId: null,
  error: null,
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  appendContent: (content) => set((state) => ({ 
    pendingContent: state.pendingContent + content 
  })),
  setDisplayedContent: (content) => set({ displayedContent: content }),
  setStreamingMessageId: (id) => set({ streamingMessageId: id }),
  setError: (error) => set({ error }),
  reset: () => set({ 
    isStreaming: false, 
    pendingContent: '', 
    displayedContent: '',
    streamingMessageId: null,
    error: null
  })
}));