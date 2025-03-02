import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { useCallback, useRef, useEffect } from 'react';
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
    isGenerating,
    currentConversationId,
    setCurrentConversationId
  } = useChatStore();

  // Update current conversation ID when the component mounts or conversation_id changes
  useEffect(() => {
    if (conversation_id && conversation_id !== currentConversationId) {
      setCurrentConversationId(conversation_id);
      
      // Clear any streaming messages from other conversations
      const streamingMessages = useChatStore.getState().streamingMessages;
      const filteredMessages = streamingMessages.filter(
        msg => msg.conversation_uuid === conversation_id
      );
      
      // Only update if there's a change to avoid unnecessary renders
      if (filteredMessages.length !== streamingMessages.length) {
        setStreamingMessages(filteredMessages, conversation_id);
      }
    }
  }, [conversation_id, currentConversationId, setCurrentConversationId]);

  const handleCancel = useCallback(() => {
    console.log('Cancel button clicked, abort controller:', abortControllerRef.current);
    
    if (abortControllerRef.current) {
      console.log('Aborting request with abort controller');
      abortControllerRef.current.abort();
    } else {
      console.log('No abort controller available');
    }
    
    // Always set generating to false to update UI immediately
    setIsGenerating(false);
  }, [setIsGenerating]);

  const mutation = useMutation({
    mutationFn: async ({ 
      message, 
      images,
      knowledge_ids 
    }: { 
      message: string, 
      images: string[] | undefined,
      knowledge_ids?: string[] | undefined 
    }) => {
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
        // Set the current conversation ID
        setCurrentConversationId(conversation_id);
        
        // Create new messages for the current conversation - only add the assistant message
        // The user message will be added by the API response to avoid duplication
        const newMessages = [
          {
            role: 'assistant' as const,
            content: '',
            model: modelName,
            name: assistantName,
            liked_by: [],
            has_images: false,
            provider: providerName,
            conversation_uuid: conversation_id,
            created_at: new Date().toISOString(),
          },
        ];
        
        setStreamingMessages(newMessages, conversation_id);
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
          knowledge_ids,
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

          // Update the current conversation ID
          setCurrentConversationId(newConversationId);

          // Set initial messages for the new conversation - only add the assistant message
          // The user message will be added by the API response to avoid duplication
          const newMessages = [
            {
              role: 'assistant' as const,
              content: '',
              model: modelName,
              name: assistantName,
              liked_by: [],
              has_images: false,
              provider: providerName,
              conversation_uuid: newConversationId,
              created_at: new Date().toISOString(),
            },
          ];
          
          setStreamingMessages(newMessages, newConversationId);

          // Invalidate for sidebar
          queryClient.invalidateQueries({ queryKey: ['conversations'] });

          // Route to the new conversation - use replace to avoid navigation history issues
          navigate(`/?c=${newConversationId}`, { replace: true });
          
          // Invalidate queries after navigation
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['messages', { conversation_id: newConversationId }] });
          }, 0);
          
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
