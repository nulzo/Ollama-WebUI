import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import { useMessages } from '@/features/chat/api/get-messages.ts';
import { useModelStore } from '@/features/models/store/model-store.ts';
import { useUser } from '@/lib/auth.tsx';
import { api } from '@/lib/api-client.ts';

export function useConversation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const { model } = useModelStore(state => ({ model: state.model }));
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

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
      setIsStreaming(true);
      abortControllerRef.current = new AbortController();

      const messageData = {
        role: 'user',
        content: message,
        model: model?.name || 'llama3.2:3b',
        user: user?.username,
        images: images,
        conversation: searchParamString || null,
      };

      await api.streamCompletion(
        messageData,
        (chunk: string) => {
          setStreamingContent(prev => prev + chunk);
        },
        abortControllerRef.current.signal
      );

      // Invalidate queries after completion
      await queryClient.invalidateQueries({
        queryKey: ['messages', { conversation_id: searchParamString }],
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation cancelled');
      } else {
        console.error('Error submitting message:', error);
      }
    } finally {
      setStreamingContent('');
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  return {
    conversationId: searchParamString,
    messages,
    submitMessage,
    cancelGeneration,
    streamingContent,
    isStreaming,
  };
}
