import { useState, useEffect, useCallback } from 'react';
import { ChatResponse, Message } from '@/types/providers/ollama';
import { v4 as uuidv4 } from 'uuid';
import { settingsService, conversationService } from '@/services/storage/client.ts';
import { useModelStore } from '@/features/models/store/model-store';
import { useCreateConversation } from '@/features/conversation/api/create-conversation';

export function useChat() {
  const { model, setModel } = useModelStore();
  const [uuid, setUuid] = useState<string>(uuidv4());
  const [message, setMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const createConversation = useCreateConversation();

  useEffect(() => {
    const fetchModel = async () => {
      const settings = await settingsService.fetchSettings();
      const default_model = settings.default_model;
      setModel(default_model ?? '');
      setLoading(false);
    };
    fetchModel();
  }, [setModel]);

  const createChat = useCallback(async () => {
    const newUuid = uuidv4();
    setUuid(newUuid);
    setMessages([]);
    createConversation.mutate({
      data: {
        uuid: newUuid,
        user: 1,
      },
    });
  }, []);

  return {
    model,
    uuid,
    message,
    isTyping,
    messages,
    loading,
    setModel,
    setMessage,
    createChat,
  };
}
