import { useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useModelStore } from '@/features/models/store/model-store';
import { streamingService } from '../services/streaming-service';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api-client';
import { StreamChunk } from '@/types/api';

/**
 * Hook for creating and sending messages in a conversation
 * Handles streaming, navigation, and error handling
 */
export const useChatMutation = (conversation_id?: string) => {
  const { model } = useModelStore();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({ content, images }: { content: string, images: string[] }) => {
      if (!model) throw new Error('No model selected');

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      // Register with streaming service
      streamingService.setAbortController(abortControllerRef.current);
      
      // Immediately add the user message to the UI
      // This ensures the user message appears instantly
      const tempUserMessage = {
        id: `temp-user-${Date.now()}`,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
        images: images || [],
        model: model.model || model.name,
        provider: model.provider,
        name: model.name || model.model,
        conversation_uuid: conversation_id,
      };
      
      // Add the temporary user message to the query cache
      if (conversation_id) {
        queryClient.setQueryData(
          ['messages', { conversation_id }],
          (oldData: any) => {
            if (!oldData) return oldData;
            
            // Create a new page with just our temp message if needed
            const newPage = {
              data: [tempUserMessage],
              pagination: oldData.pages[0]?.pagination || { page: 1, hasMore: false },
              success: true,
              status: 200,
              meta: oldData.pages[0]?.meta || {},
              links: oldData.pages[0]?.links || {},
            };
            
            // Add to the first page if it exists, otherwise create a new page
            if (oldData.pages.length > 0) {
              return {
                ...oldData,
                pages: oldData.pages.map((page: any, index: number) => 
                  index === 0 ? { ...page, data: [...page.data, tempUserMessage] } : page
                )
              };
            } else {
              return {
                ...oldData,
                pages: [newPage]
              };
            }
          }
        );
      }
      
      // Dispatch event to notify that a message is being sent
      window.dispatchEvent(new CustomEvent('message-sent'));

      try {
        // Format data according to what worked in your previous implementation
        const messageData = {
          content: content || 'erm',
          conversation_uuid: conversation_id, // Use conversation_uuid directly
          role: 'user',
          model: model.model || model.name,
          provider: model.provider,
          name: model.name || model.model,
          images: images || [],
        };
        
        console.log('Sending message data:', messageData);
        
        await api.streamCompletion(
          messageData,
          (chunk: StreamChunk) => {
            // Handle conversation creation
            if (chunk.conversation_uuid) {
              window.dispatchEvent(
                new CustomEvent('conversation-created', {
                  detail: { uuid: chunk.conversation_uuid },
                })
              );
              return;
            }

            // Handle errors
            if (chunk.error) {
              window.dispatchEvent(
                new CustomEvent('chat-error', { 
                  detail: { error: chunk.error } 
                })
              );
              return;
            }

            // Handle content chunks
            if (chunk.content || (chunk.delta?.content)) {
              const chunkContent = chunk.content || chunk.delta?.content || '';
              window.dispatchEvent(
                new CustomEvent('message-chunk', {
                  detail: {
                    message: {
                      role: 'assistant',
                      content: chunkContent,
                    },
                  },
                })
              );
            }

            // Handle completion
            if (chunk.status === 'done' || chunk.type === 'done') {
              window.dispatchEvent(new CustomEvent('message-done'));
              
              // If we have a message ID, dispatch that event too
              if (chunk.message_id) {
                window.dispatchEvent(
                  new CustomEvent('message-created', {
                    detail: { id: chunk.message_id },
                  })
                );
              }
              
              // Invalidate queries to ensure data is fresh
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
              if (conversation_id) {
                queryClient.invalidateQueries({ queryKey: ['messages', { conversation_id }] });
                queryClient.invalidateQueries({ queryKey: ['conversation', conversation_id] });
              }
            }
          },
          abortControllerRef.current.signal
        );
        
        // If this was a new chat, the streaming service will have received the new conversation ID
        // We can use this to navigate to the new conversation
        if (!conversation_id) {
          const state = streamingService.getState();
          if (state.conversationId) {
            navigate(`/chat/${state.conversationId}`);
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error in streaming completion:', error);
          window.dispatchEvent(
            new CustomEvent('chat-error', { 
              detail: { error: error.message || 'An error occurred during streaming' } 
            })
          );
          
          // Show error toast
          toast({
            title: 'Error sending message',
            description: error.message || 'An unknown error occurred',
            variant: 'destructive',
          });
        }
        
        // Signal completion even on error to clean up UI state
        window.dispatchEvent(new CustomEvent('message-done'));
        throw error;
      } finally {
        // Clean up the AbortController
        abortControllerRef.current = null;
        streamingService.setAbortController(null);
      }
    },
    onError: (error) => {
      console.error('Chat mutation error:', error);
      
      // Show error toast
      if (error.name !== 'AbortError') {
        toast({
          title: 'Error sending message',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
      }
    },
  });

  const handleSubmit = useCallback(async (content: string, images: string[] = []) => {
    if (!model) {
      toast({
        title: 'No model selected',
        description: 'Please select a model before sending a message',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      return;
    }

    try {
      await mutation.mutateAsync({ content, images });
    } catch (error: unknown) {
      // Error is already handled in the mutation
    }
  }, [model, mutation]);

  const handleCancel = useCallback(() => {
    streamingService.abort();
  }, []);

  return {
    mutation,
    handleSubmit,
    handleCancel,
    isLoading: mutation.isPending,
  };
};