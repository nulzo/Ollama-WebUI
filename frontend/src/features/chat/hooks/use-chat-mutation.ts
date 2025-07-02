import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { useCallback, useRef, useEffect } from 'react';
import { useChatStore } from '../stores/chat-store';
import { useNavigate } from 'react-router-dom';
import { useModelStore } from '@/features/models/store/model-store';
import { handleStreamChunk } from '../services/stream-service';

export function useChatMutation(conversation_id?: string) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const model = useModelStore(state => state.model);
  const {
    setStreamingMessages,
    updateLastMessage,
    status,
    setStatus,
    currentConversationId,
    setCurrentConversationId,
  } = useChatStore();

  const storeActions = {
    setStreamingMessages,
    updateLastMessage,
    setStatus,
    setCurrentConversationId,
  };

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
  }, [conversation_id, currentConversationId, setCurrentConversationId, setStreamingMessages]);

  const handleCancel = useCallback(() => {
    console.log('Cancel button clicked, abort controller:', abortControllerRef.current);
    
    if (abortControllerRef.current) {
      console.log('Aborting request with abort controller');
      abortControllerRef.current.abort();
    } else {
      console.log('No abort controller available');
    }
    
    // Always set generating to false to update UI immediately
    setStatus('idle');
  }, [setStatus]);

  const mutation = useMutation({
    mutationFn: async ({ 
      message, 
      images,
      knowledge_ids,
      function_call 
    }: { 
      message: string, 
      images: string[] | undefined,
      knowledge_ids?: string[] | undefined,
      function_call?: boolean | undefined
    }) => {
      if (!user) throw new Error('Authentication required');
      if (!model) throw new Error('No model selected');

      const modelId = model.id;
      const modelName = model.model;
      const providerName = model.provider || 'ollama';
      const assistantName = model.name || 'Assistant';

      abortControllerRef.current = new AbortController();
      setStatus('generating');

      if (conversation_id) {
        setCurrentConversationId(conversation_id);
        
        // Only add the assistant's placeholder message to the streaming store.
        // The user's message will appear once the query is invalidated and refetched, preventing duplication.
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
        // Log function call status for debugging
        console.log('Function call enabled:', function_call);
        
        const new_msg = {
          content: message,
          conversation_uuid: conversation_id,
          role: 'user',
          user: user?.id,
          model: modelId,
          name: assistantName,
          provider: providerName,
          images: images || [],
          knowledge_ids,
          function_call: function_call || false,
        };
        
        console.log('Sending message with options:', new_msg);
        
        await api.streamCompletion(
          new_msg,
          chunk => {
            handleStreamChunk(
              {
                chunk,
                queryClient,
                navigate,
                model: {
                  id: modelId,
                  name: assistantName,
                  model: modelName,
                  provider: providerName,
                },
                storeActions,
                userMessage: message,
              },
              conversation_id,
            );
          },
          abortControllerRef.current.signal,
        );
      } catch (error) {
        throw error; // Let onError handle all errors
      } finally {
        setStatus('idle');
        abortControllerRef.current = null;
      }
    },
    onError: error => {
      if (error.name === 'AbortError') {
        const streamingMessages = useChatStore.getState().streamingMessages;
        if (streamingMessages.length > 0) {
          const lastMessage = streamingMessages[streamingMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            updateLastMessage(' [cancelled]');
          }
        }
        // Set status to idle if the request was cancelled
        setStatus('idle');
      } else {
        console.error('Chat error:', error);
        updateLastMessage(' Error');
        setStatus('error');
      }
    },
  });

  return {
    mutation,
    status,
    handleCancel,
  };
}
