import { QueryClient } from '@tanstack/react-query';
import { NavigateFunction } from 'react-router-dom';
import { ChatState } from '../stores/chat-store';

type StoreActions = Pick<
  ChatState,
  'setStreamingMessages'
  | 'updateLastMessage'
  | 'setStatus'
  | 'setCurrentConversationId'
>;

export type StreamHandlerParams = {
  chunk: any;
  queryClient: QueryClient;
  navigate: NavigateFunction;
  model: { id: string; name: string; model: string; provider: string };
  storeActions: StoreActions;
  userMessage?: string;
};

export const handleStreamChunk = (
  {
    chunk,
    queryClient,
    navigate,
    model,
    storeActions,
    userMessage,
  }: StreamHandlerParams,
  conversation_id?: string,
) => {
  const {
    setStreamingMessages,
    updateLastMessage,
    setStatus,
    setCurrentConversationId,
  } = storeActions;

  let parsedChunk = chunk;
  if (typeof chunk === 'string') {
    try {
      parsedChunk = JSON.parse(chunk);
    } catch (e) {
      updateLastMessage(chunk);
      return;
    }
  }

  const { status, content, conversation_uuid, tool_calls } = parsedChunk;

  switch (status) {
    case 'waiting':
      setStatus('waiting');
      break;
    case 'generating':
      setStatus('generating');
      if (content) {
        updateLastMessage(content);
      }
      break;
    case 'cancelled':
      updateLastMessage(content || ' [cancelled]');
      setStatus('idle');
      break;
    case 'done':
      setStatus('idle');
      break;
    case 'tool_call':
      if (tool_calls?.length > 0) {
        queryClient.invalidateQueries({
          queryKey: ['messages', { conversation_id: conversation_id || conversation_uuid }],
        });
      }
      break;
    case 'created':
      if (conversation_uuid) {
        const newConversationId = conversation_uuid;
        setCurrentConversationId(newConversationId);
        
        const baseTimestamp = Date.now();
        const newMessages = [];
        
        if (userMessage) {
          newMessages.push({
            role: 'user' as const,
            content: userMessage,
            model: model.model,
            name: 'User',
            liked_by: [],
            has_images: false,
            provider: model.provider || 'ollama',
            conversation_uuid: newConversationId,
            created_at: new Date(baseTimestamp).toISOString(),
          });
        }
        
        newMessages.push({
          role: 'assistant' as const,
          content: '',
          model: model.model,
          name: model.name || 'Assistant',
          liked_by: [],
          has_images: false,
          provider: model.provider || 'ollama',
          conversation_uuid: newConversationId,
          created_at: new Date(baseTimestamp + 1).toISOString(),
        });
        
        setStreamingMessages(newMessages, newConversationId);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        navigate(`/?c=${newConversationId}`, { replace: true });
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['messages', { conversation_id: newConversationId }],
          });
        }, 0);
      }
      break;
    default:
      if (content) {
        updateLastMessage(content);
      }
      break;
  }
}; 