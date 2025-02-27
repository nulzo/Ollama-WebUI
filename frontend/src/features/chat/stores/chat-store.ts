import { create } from 'zustand';
import { Message } from '../types/message';

// Define a maximum number of messages to keep in memory
const MAX_STREAMING_MESSAGES = 20; // Reduced from 50 to 20 for better memory usage

interface ChatState {
  streamingMessages: Message[];
  isGenerating: boolean;
  isWaiting: boolean;
  setStreamingMessages: (messages: Message[]) => void;
  updateLastMessage: (content: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setIsWaiting: (waiting: boolean) => void;
  cleanupOldMessages: () => void;
  resetState: () => void; // New function to completely reset state
}

export const useChatStore = create<ChatState>((set) => ({
  streamingMessages: [],
  isGenerating: false,
  isWaiting: false,
  
  setStreamingMessages: (messages) => set({ 
    // Limit the number of messages stored in state
    streamingMessages: messages.slice(-MAX_STREAMING_MESSAGES) 
  }),
  
  updateLastMessage: (content) => 
    set((state) => {
      const messages = [...state.streamingMessages];
      if (messages.length === 0) return state;
      
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        // Create a new message object instead of mutating the existing one
        messages[messages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + content,
        };
      }
      return { streamingMessages: messages };
    }),
    
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setIsWaiting: (waiting) => set({ isWaiting: waiting }),
  
  // Add a cleanup method to be called periodically
  cleanupOldMessages: () => set(state => ({
    streamingMessages: state.streamingMessages.slice(-MAX_STREAMING_MESSAGES)
  })),
  
  // Complete reset of state
  resetState: () => set({
    streamingMessages: [],
    isGenerating: false,
    isWaiting: false
  })
}));