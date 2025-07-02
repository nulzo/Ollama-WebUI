import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '@/features/chat/stores/chat-store';
import { useStreamingStore } from '@/features/chat/stores/streaming-store';
import { useModelStore } from '@/features/models/store/model-store';

export function useChatView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const navigate = useNavigate();
  const {
    streamingMessages,
    currentConversationId,
    setCurrentConversationId,
    resetState,
  } = useChatStore();
  const model = useModelStore(state => state.model);

  const [currentTheme, setCurrentTheme] = useState<
    'casual' | 'creative' | 'inspirational' | 'analytical'
  >('casual');
  const [functionCallEnabled, setFunctionCallEnabled] = useState(false);

  useEffect(() => {
    if (model && !model.tools_enabled) {
      setFunctionCallEnabled(false);
    }
  }, [model]);

  useEffect(() => {
    return () => {
      useChatStore.getState().resetState();
      useStreamingStore.getState().reset();
    };
  }, []);

  const handleNewChat = useCallback(() => {
    resetState();
    navigate('/', { replace: true });
    setSearchParams({}, { replace: true });
  }, [navigate, setSearchParams, resetState]);

  useEffect(() => {
    if (searchParamString && searchParamString !== currentConversationId) {
      setCurrentConversationId(searchParamString);
    } else if (!searchParamString) {
      setCurrentConversationId(null);
    }
  }, [searchParamString, currentConversationId, setCurrentConversationId]);

  useEffect(() => {
    if (streamingMessages.length > 0 && !searchParamString) {
      const lastMessageWithConversation = [...streamingMessages]
        .reverse()
        .find(msg => msg.conversation_uuid && msg.conversation_uuid !== 'pending');
      
      if (lastMessageWithConversation?.conversation_uuid) {
        setSearchParams({ c: lastMessageWithConversation.conversation_uuid }, { replace: true });
      }
    }
  }, [streamingMessages, searchParamString, setSearchParams]);

  const handleThemeChange = useCallback(
    (theme: 'casual' | 'creative' | 'inspirational' | 'analytical') => {
      setCurrentTheme(theme);
    },
    [],
  );

  return {
    searchParamString,
    currentTheme,
    functionCallEnabled,
    setFunctionCallEnabled,
    handleNewChat,
    handleThemeChange,
  };
} 