import React, { createContext, useContext, useState } from 'react';
import { Message } from '../types/message';

interface ChatContextType {
  streamingMessages: Message[];
  setStreamingMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  isWaiting: boolean;
  setIsWaiting: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [streamingMessages, setStreamingMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);


  return (
    <ChatContext.Provider value={{ 
      streamingMessages,
      setStreamingMessages,
      isGenerating,
      setIsGenerating,
      isWaiting,
      setIsWaiting
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
