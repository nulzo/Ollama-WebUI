import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { useRef } from 'react';
import { useChatContext } from '../stores/chat-context';
import { useNavigate } from 'react-router-dom';

export function useChatMutation(conversation_id?: string) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setStreamingMessages, setIsGenerating, isGenerating } = useChatContext();

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user) throw new Error('Authentication required');

      setIsGenerating(true);
      abortControllerRef.current = new AbortController();

      // Add initial messages only if we're in an existing conversation
      if (conversation_id) {
        setStreamingMessages([
          {
            role: 'user',
            content: message,
            model: 'llama3.2:3b',
            liked_by: [],
            has_images: false,
            conversation_uuid: conversation_id,
            user: user?.id?.toString() ?? '',
            created_at: new Date().toISOString(),
          },
          {
            role: 'assistant',
            content: '',
            model: 'llama3.2:3b',
            liked_by: [],
            has_images: false,
            conversation_uuid: conversation_id,
            created_at: new Date().toISOString(),
          },
        ]);
      }


      try {
        await api.streamCompletion(
          {
            content: message,
            conversation_uuid: conversation_id,
            role: 'user',
            user: user?.id,
            model: 'llama3.2:3b',
            images: [],
          },
          chunk => {
            // Parse the chunk as JSON
            const parsedChunk = typeof chunk === 'string' ? JSON.parse(chunk) : chunk;
            
            // If this is a new conversation
            if (parsedChunk.conversation_uuid && parsedChunk.status === 'created') {
              const newConversationId = parsedChunk.conversation_uuid;
              
              // Set initial messages for the new conversation
              setStreamingMessages([
                {
                  role: 'assistant',
                  content: '',
                  model: 'llama3.2:3b',
                  liked_by: [],
                  has_images: false,
                  conversation_uuid: newConversationId,
                  created_at: new Date().toISOString(),
                },
              ]);

              // Invalidate for sidebar
              queryClient.invalidateQueries({ queryKey: ['conversations'] });

              // Route to the new conversation
              navigate(`/?c=${newConversationId}`);
              return;
            }

            setStreamingMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage?.role === 'assistant') {
                newMessages[newMessages.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + (parsedChunk.content || ''),
                };
              }
              return newMessages;
            });
          },
          abortControllerRef.current.signal
        );
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;

        // Don't clear streaming messages immediately
        // Instead, wait for the query invalidation to update the UI
        const currentConversationId = conversation_id || queryClient.getQueryData(['currentConversation']);
        if (currentConversationId) {
          // Invalidate queries and wait for them to settle
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['conversations'] }),
            queryClient.invalidateQueries({ queryKey: ['messages', { conversation_id: currentConversationId }] })
          ]);
          
          // Only clear streaming messages after queries have updated
          setTimeout(() => {
            setStreamingMessages([]);
          }, 100);
        }
      }
    },
    onError: error => {
      if (error.name === 'AbortError') {
        setStreamingMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + ' [cancelled]',
            };
          }
          return newMessages;
        });
      } else {
        console.error('Chat error:', error);
        setStreamingMessages(prev => [
          ...prev,
          {
            content: 'Sorry, there was an error processing your request.',
            role: 'assistant',
          },
        ]);
      }
      setIsGenerating(false);
    },
  });

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  return {
    mutation,
    isGenerating,
    handleCancel,
  };
}
