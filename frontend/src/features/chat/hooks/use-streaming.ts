import { useEffect, useState, useCallback } from 'react';
import { streamingService, StreamingState } from '../services/streaming-service';

/**
 * Hook for accessing and managing streaming state
 * Provides a convenient interface for components to interact with the streaming service
 * Enhanced with typing animation controls and better state management
 */
export function useStreaming() {
  const [state, setState] = useState<StreamingState>(streamingService.getState());
  
  useEffect(() => {
    // Subscribe to streaming service updates
    const unsubscribe = streamingService.subscribe(newState => {
      setState(newState);
    });
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);
  
  // Memoized reset function to avoid recreating on each render
  const reset = useCallback(() => {
    streamingService.reset();
  }, []);
  
  // Memoized abort function to avoid recreating on each render
  const abort = useCallback(() => {
    streamingService.abort();
  }, []);
  
  // Memoized function to adjust typing speed
  const setTypingSpeed = useCallback((speed: number) => {
    streamingService.setTypingSpeed(speed);
  }, []);
  
  return {
    ...state,
    isStreaming: state.status === 'streaming',
    isWaiting: state.status === 'waiting',
    isError: state.status === 'error',
    isComplete: state.status === 'complete',
    isIdle: state.status === 'idle',
    isGenerating: ['waiting', 'streaming'].includes(state.status),
    isTyping: state.isTyping,
    contentHeight: state.contentHeight,
    reset,
    abort,
    setTypingSpeed,
  };
}