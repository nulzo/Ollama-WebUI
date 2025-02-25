import { create } from 'zustand';
import { Message } from '../types/message';

interface ChatState {
  streamingMessages: Message[];
  isGenerating: boolean;
  isWaiting: boolean;
  setStreamingMessages: (messages: Message[]) => void;
  updateLastMessage: (content: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setIsWaiting: (waiting: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  streamingMessages: [],
  isGenerating: false,
  isWaiting: false,
  setStreamingMessages: (messages) => set({ streamingMessages: messages }),
  updateLastMessage: (content) => 
    set((state) => {
      const messages = [...state.streamingMessages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        messages[messages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + content,
        };
      }
      return { streamingMessages: messages };
    }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setIsWaiting: (waiting) => set({ isWaiting: waiting }),
}));
