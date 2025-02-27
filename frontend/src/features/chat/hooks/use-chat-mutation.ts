import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { useCallback, useRef } from 'react';
import { useChatStore } from '../stores/chat-store';
import { useNavigate } from 'react-router-dom';
import { useModelStore } from '@/features/models/store/model-store';

export function useChatMutation(conversation_id?: string) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const model = useModelStore(state => state.model);
  const {
    setStreamingMessages,
    updateLastMessage,
    setIsGenerating,
    setIsWaiting,
    isGenerating
  } = useChatStore();

  const handleCancel = useCallback(() => {
    console.log('Cancel button clicked, abort controller:', abortControllerRef.current);
    
    if (abortControllerRef.current) {
      console.log('Aborting request with abort controller');
      abortControllerRef.current.abort();
      
      // Also try to call the backend cancel endpoint as a fallback
      api.cancelGeneration().catch(err => {
        console.error('Error calling cancel endpoint:', err);
      });
    } else {
      console.log('No abort controller available, trying backend cancel endpoint');
      api.cancelGeneration().catch(err => {
        console.error('Error calling cancel endpoint:', err);
      });
    }
    
    // Always set generating to false to update UI immediately
    setIsGenerating(false);
  }, [setIsGenerating]);


  const mutation = useMutation({
    mutationFn: async ({ message, images }: { message: string, images: string[] | undefined }) => {
      if (!user) throw new Error('Authentication required');
      if (!model) throw new Error('No model selected');

      const modelName = model.model;
      const providerName = model.provider || 'ollama';
      const assistantName = model.name || 'Assistant';

      abortControllerRef.current = new AbortController();
      setIsGenerating(true);
      setIsWaiting(false);

      // Add initial messages only if we're in an existing conversation
      if (conversation_id) {
        setStreamingMessages([
          {
            role: 'user',
            content: message,
            model: modelName,
            name: assistantName,
            liked_by: [],
            has_images: false,
            conversation_uuid: conversation_id,
            user_id: user?.id,
            provider: providerName,
            created_at: new Date().toISOString(),
          },
          {
            role: 'assistant',
            content: '',
            model: modelName,
            name: assistantName,
            liked_by: [],
            has_images: false,
            provider: providerName,
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
          model: modelName,
          name: assistantName,
          provider: providerName,
          images: images || [],
        }
        await api.streamCompletion(
          new_msg,
          chunk => {
            console.log('Received chunk in callback:', chunk);
            
            // Handle the chunk based on its type
            if (typeof chunk === 'string') {
              console.log('Chunk is a string, attempting to parse as JSON');
              try {
                // Try to parse it as JSON if it's a string
                const parsedChunk = JSON.parse(chunk);
                console.log('Successfully parsed string chunk as JSON:', parsedChunk);
                handleChunk(parsedChunk);
              } catch (e) {
                console.log('Failed to parse as JSON, treating as plain text');
                // If it's just a plain string, update the last message with it
                updateLastMessage(chunk);
              }
            } else {
              console.log('Chunk is already an object:', chunk);
              // It's already a StreamChunk object
              handleChunk(chunk);
            }
          },
          abortControllerRef.current.signal
        );
      } catch (error) {
        console.log('Caught error in mutation:', error);
        throw error; // Let onError handle all errors
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
      
      // Helper function to handle chunk objects
      function handleChunk(parsedChunk: any) {
        console.log('Handling chunk:', parsedChunk);
        
        // Handle different status types
        if (parsedChunk.status === 'waiting') {
          console.log('Setting waiting state to true');
          setIsWaiting(true);
          return;
        } else if (parsedChunk.status === 'generating') {
          console.log('Setting waiting state to false');
          setIsWaiting(false);
        } else if (parsedChunk.status === 'cancelled') {
          // Handle cancelled status from the server
          console.log('Received cancelled status from server');
          
          // If there's content in the chunk (like " [cancelled]"), append it
          if (parsedChunk.content) {
            console.log('Appending cancellation content:', parsedChunk.content);
            updateLastMessage(parsedChunk.content);
          } else {
            // Otherwise just append [cancelled] marker
            console.log('Appending [cancelled] marker');
            updateLastMessage(' [cancelled]');
          }
          
          // Set generating to false to update UI
          setIsGenerating(false);
          return;
        } else if (parsedChunk.status === 'done') {
          console.log('Generation complete');
          setIsGenerating(false);
        }

        // If this is a new conversation
        if (parsedChunk.conversation_uuid && parsedChunk.status === 'created') {
          const newConversationId = parsedChunk.conversation_uuid;
          console.log('New conversation created:', newConversationId);

          // Set initial messages for the new conversation
          setStreamingMessages([
            {
              role: 'assistant',
              content: '',
              model: modelName,
              name: assistantName,
              liked_by: [],
              has_images: false,
              provider: providerName,
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

        // Handle regular content updates
        if (parsedChunk.content) {
          console.log('Updating last message with content:', parsedChunk.content);
          updateLastMessage(parsedChunk.content);
        }
      }
    },
    onError: error => {
      console.log('Error in mutation:', error);
      
      if (error.name === 'AbortError') {
        console.log('Handling AbortError in onError handler');
        
        // Update the last message to show it was cancelled
        const streamingMessages = useChatStore.getState().streamingMessages;
        if (streamingMessages.length > 0) {
          const lastMessage = streamingMessages[streamingMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            console.log('Appending [cancelled] to last assistant message');
            updateLastMessage(' [cancelled]');
          }
        }
      } else {
        console.error('Chat error:', error);
        updateLastMessage(' Error');
      }
      
      // Always set generating to false to update UI
      setIsGenerating(false);
    },
  });

  return {
    mutation,
    isGenerating,
    handleCancel,
  };
}
