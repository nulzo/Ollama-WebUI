import { useEffect, useRef, RefObject } from 'react';

const useScrollToEnd = (messages: unknown[], streamingContent?: string): RefObject<HTMLDivElement> => {
  const ref = useRef<HTMLDivElement>(null);

  // Immediate scroll on conversation change
  useEffect(() => {
    if (ref.current && messages.length > 0) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        ref.current?.scrollIntoView({ behavior: 'instant' });
      });
    }
  }, [messages.length]); // Only depend on message count changes

  // Smooth scroll during streaming
  useEffect(() => {
    if (ref.current && streamingContent) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamingContent]);

  return ref;
};

export default useScrollToEnd;