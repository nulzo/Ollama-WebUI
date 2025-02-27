import { create } from 'zustand';

// Maximum content length to prevent excessive memory usage
const MAX_CONTENT_LENGTH = 100000;

interface StreamingState {
  isStreaming: boolean;
  pendingContent: string;
  displayedContent: string;
  setIsStreaming: (isStreaming: boolean) => void;
  appendContent: (content: string) => void;
  setDisplayedContent: (content: string) => void;
  reset: () => void;
  truncateContent: () => void; // New function to prevent excessive memory usage
}

export const useStreamingStore = create<StreamingState>((set) => ({
  isStreaming: false,
  pendingContent: '',
  displayedContent: '',
  
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  
  appendContent: (content) => set((state) => {
    // Prevent excessive memory usage by truncating if needed
    const newContent = state.pendingContent + content;
    if (newContent.length > MAX_CONTENT_LENGTH) {
      return { 
        pendingContent: newContent.slice(-MAX_CONTENT_LENGTH) 
      };
    }
    return { pendingContent: newContent };
  }),
  
  setDisplayedContent: (content) => set({ 
    displayedContent: content.length > MAX_CONTENT_LENGTH 
      ? content.slice(-MAX_CONTENT_LENGTH) 
      : content 
  }),
  
  reset: () => set({ 
    isStreaming: false, 
    pendingContent: '', 
    displayedContent: '' 
  }),
  
  truncateContent: () => set((state) => ({
    pendingContent: state.pendingContent.length > MAX_CONTENT_LENGTH 
      ? state.pendingContent.slice(-MAX_CONTENT_LENGTH) 
      : state.pendingContent,
    displayedContent: state.displayedContent.length > MAX_CONTENT_LENGTH 
      ? state.displayedContent.slice(-MAX_CONTENT_LENGTH) 
      : state.displayedContent
  }))
}));