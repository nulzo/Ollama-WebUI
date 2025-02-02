import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { useCallback, useRef } from 'react';
import { useChatContext } from '../stores/chat-context';
import { useNavigate } from 'react-router-dom';
import { useModelStore } from '@/features/models/store/model-store';

export function useChatMutation(conversation_id?: string) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setStreamingMessages, setIsGenerating, setIsWaiting, isGenerating, isWaiting } = useChatContext();
  const model = useModelStore(state => state.model);

  const handleCancel = useCallback(() => {
    console.log('handleCancel called', {
      hasAbortController: !!abortControllerRef.current,
      isGenerating
    });
    if (abortControllerRef.current) {
      console.log('aborting');
      abortControllerRef.current.abort();
    }
  }, [isGenerating]);


  const mutation = useMutation({
    mutationFn: async ({ message, images }: { message: string, images: string[] | undefined }) => {
      if (!user) throw new Error('Authentication required');
      if (!model) throw new Error('No model selected');

      abortControllerRef.current = new AbortController();
      setIsGenerating(true);
      setIsWaiting(false);

      // Add initial messages only if we're in an existing conversation
      if (conversation_id) {
        setStreamingMessages([
          {
            role: 'user',
            content: message,
            model: model?.name,
            liked_by: [],
            has_images: false,
            conversation_uuid: conversation_id,
            user: user?.id?.toString() ?? '',
            created_at: new Date().toISOString(),
          },
          {
            role: 'assistant',
            content: '',
            model: model?.name,
            liked_by: [],
            has_images: false,
            conversation_uuid: conversation_id,
            created_at: new Date().toISOString(),
          },
        ]);
      }


      try {
        const new_msg = {
          content: message,
          conversation_uuid: conversation_id,
          role: 'user',
          user: user?.id,
          model: model?.name,
          images: images || [],
        }
        console.log("new_msg", new_msg);
        await api.streamCompletion(
          new_msg,
          chunk => {
            // Parse the chunk as JSON
            const parsedChunk = typeof chunk === 'string' ? JSON.parse(chunk) : chunk;

            if (parsedChunk.status === 'waiting') {
              setIsWaiting(true);
              return;
            } else if (parsedChunk.status === 'generating') {
              setIsWaiting(false);
            }

            // If this is a new conversation
            if (parsedChunk.conversation_uuid && parsedChunk.status === 'created') {
              const newConversationId = parsedChunk.conversation_uuid;

              // Set initial messages for the new conversation
              setStreamingMessages([
                {
                  role: 'assistant',
                  content: '',
                  model: model?.name,
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
              queryClient.invalidateQueries({ queryKey: ['messages', { conversation_id: newConversationId }] })
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
      } catch (error) {
        console.log('Caught error in mutation:', error);
        throw error; // Let onError handle all errors
      } finally {
        // Only cleanup if it's not an abort error
        if (!abortControllerRef.current?.signal.aborted) {
          setIsGenerating(false);
          setIsWaiting(false);
          abortControllerRef.current = null;

          const currentConversationId = conversation_id || queryClient.getQueryData(['currentConversation']);
          if (currentConversationId) {
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['conversations'] }),
              queryClient.invalidateQueries({ queryKey: ['messages', { conversation_id: currentConversationId }] })
            ]);
            setStreamingMessages([]);
          }
        }
      }
    },
    onError: error => {
      console.log('Caught error in mutation:', error);
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

  return {
    mutation,
    isGenerating,
    handleCancel,
  };
}
