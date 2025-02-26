import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { useMessages } from '@/features/chat/api/get-messages.ts';
import { useModelStore } from '@/features/models/store/model-store.ts';
import { useUser } from '@/lib/auth.tsx';
import { api } from '@/lib/api-client.ts';

export function useConversation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const model = useModelStore(state => state.model);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [assistantMessage, setAssistantMessage] = useState<string>('');

  const messages = useMessages({
    conversation_id: searchParamString ?? '',
  });

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const submitMessage = async (message: string, images: string[] = []): Promise<void> => {
    if (!message.trim()) return;

    try {
      const userMessage = {
        data: {
          id: Date.now().toString(),
          role: 'user',
          content: message,
          created_at: new Date().toISOString(),
          model: model?.name || 'llama3.2:3b',
          user: user?.id,
          liked_by: [],
          has_images: images.length > 0,
          conversation: searchParamString || null,
        },
      };
      setLocalMessages(prev => [...prev, userMessage]);
      setIsStreaming(true);
      abortControllerRef.current = new AbortController();
      await api.streamCompletion(
        userMessage.data,
        (chunk: string) => {
          setLocalMessages(prev => {
            const newMessages = [...prev];
            const assistantMsg = newMessages.find(m => m.data.role === 'assistant');
            if (assistantMsg) {
              assistantMsg.data.content += chunk;
            }
            return newMessages;
          });
        },
        abortControllerRef.current.signal
      );
      await queryClient.invalidateQueries({
        queryKey: ['messages', { conversation_id: searchParamString }],
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setLocalMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.data.role === 'assistant') {
            lastMessage.data.content += ' [cancelled]';
          }
          return newMessages;
        });
      } else {
        console.error('Error submitting message:', error);
      }
    } finally {
      setStreamingContent('');
      setIsStreaming(false);
      setLocalMessages([]);
      abortControllerRef.current = null;
    }
  };

  return {
    conversation: searchParamString,
    messages,
    submitMessage,
    cancelGeneration,
    streamingContent,
    isStreaming,
    localMessages,
    assistantMessage,
  };
}
