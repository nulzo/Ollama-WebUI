import { QueryClient } from '@tanstack/react-query';
import { NavigateFunction } from 'react-router-dom';
import { StreamingState, StreamingActions } from '../stores/streaming-store';
import { logger } from '@/lib/logger';

type StreamStore = StreamingState & StreamingActions;

interface StreamChunk {
  status: 'waiting' | 'generating' | 'cancelled' | 'done' | 'tool_call' | 'created';
  content?: string;
  conversation_uuid?: string;
  tool_calls?: any[]; // Replace 'any' with a proper type if available
}

const handleWaiting = (store: StreamStore) => {
  logger.info('Setting waiting state to true');
  store.setIsWaiting(true);
};

const handleGenerating = (store: StreamStore) => {
  logger.info('Setting waiting state to false');
  store.setIsWaiting(false);
};

const handleCancelled = (chunk: StreamChunk, store: StreamStore) => {
  logger.info('Received cancelled status from server');
  const content = chunk.content || ' [cancelled]';
  logger.info('Appending cancellation content:', content);
  store.updateLastMessage(content);
  store.setIsGenerating(false);
};

const handleDone = (store: StreamStore) => {
  logger.info('Generation complete');
  store.setIsGenerating(false);
};

const handleToolCall = (chunk: StreamChunk, queryClient: QueryClient) => {
  logger.info('Received tool call:', chunk);
  if (chunk.tool_calls && chunk.tool_calls.length > 0) {
    queryClient.invalidateQueries({
      queryKey: ['messages', { conversation_id: chunk.conversation_uuid }],
    });
  }
};

const handleCreated = (
  chunk: StreamChunk,
  store: StreamStore,
  queryClient: QueryClient,
  navigate: NavigateFunction,
) => {
  const newConversationId = chunk.conversation_uuid;
  if (!newConversationId) return;

  logger.info('New conversation created:', newConversationId);

  store.updateLastMessage({ conversation_uuid: newConversationId });

  queryClient.invalidateQueries({ queryKey: ['conversations'] });
  navigate(`/?c=${newConversationId}`, { replace: true });
  queryClient.invalidateQueries({
    queryKey: ['messages', { conversation_id: newConversationId }],
  });
};

const handleContent = (chunk: StreamChunk, store: StreamStore) => {
  if (chunk.content) {
    logger.info('Updating last message with content:', chunk.content);
    store.updateLastMessage(chunk.content);
  }
};

export const handleStreamChunk = (
  chunk: StreamChunk,
  store: StreamStore,
  queryClient: QueryClient,
  navigate: NavigateFunction,
  model: { model: string; name: string; provider: string },
) => {
  switch (chunk.status) {
    case 'waiting':
      handleWaiting(store);
      break;
    case 'generating':
      handleGenerating(store);
      break;
    case 'cancelled':
      handleCancelled(chunk, store);
      break;
    case 'done':
      handleDone(store);
      break;
    case 'tool_call':
      handleToolCall(chunk, queryClient);
      break;
    case 'created':
      handleCreated(
        chunk,
        store,
        queryClient,
        navigate,
      );
      break;
    default:
      handleContent(chunk, store);
  }
}; 