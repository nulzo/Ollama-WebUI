import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/providers/ollama'; // Adjust the import to your actual path
import { fetchMessages, sendMessage } from './api';
import { useModelStore } from '@/features/models/store/model-store.ts'; // Assuming these functions are implemented

export const useChatMessages = (conversationId: string) => {
  const { model, setModel } = useModelStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const fetchedMessages = await fetchMessages(conversationId);
      setMessages(fetchedMessages);
    } catch (err) {
      setError('Failed to fetch messages');
    }
  }, [conversationId]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return { messages, error, addMessage };
};
