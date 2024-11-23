import { useState } from 'react';

export function useStreamMessage() {
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleStreamingUpdate = (content: string) => {
    setStreamingContent(content);
    setIsStreaming(true);
  };

  const resetStreaming = () => {
    setStreamingContent('');
    setIsStreaming(false);
  };

  return {
    streamingContent,
    isStreaming,
    handleStreamingUpdate,
    resetStreaming
  };
}