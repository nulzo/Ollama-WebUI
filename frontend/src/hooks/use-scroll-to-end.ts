import { useEffect, useRef, RefObject } from 'react';

const useScrollToEnd = (messages: unknown[], streamingContent?: string): RefObject<HTMLDivElement> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple scroll to bottom whenever messages change or streaming content updates
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent]);

  return ref;
};

export default useScrollToEnd;