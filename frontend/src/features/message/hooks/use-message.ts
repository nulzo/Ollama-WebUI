import { useState, useCallback } from 'react';
import { messageService } from '@/services/storage/client';
import { CreateMessageInput } from './use-create-message';

export function useMessage(model: string, uuid: string) {
  const [messages, setMessages] = useState<CreateMessageInput[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');

  const write = useCallback(
    async (response): Promise<void> => {
      let curr = '';
      for await (const part of response) {
        curr += part.message.content;
      }
      setIsTyping(false);
      const newMessage: CreateMessageInput = {
        role: 'assistant',
        content: curr,
        conversation: uuid,
        model,
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      await messageService.createMessage(newMessage);
    },
    [uuid, model]
  );

  return {
    messages,
    message,
    isTyping,
    setMessages,
    setMessage,
    setIsTyping,
    write,
  };
}
