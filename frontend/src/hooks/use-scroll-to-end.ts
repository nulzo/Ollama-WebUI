import { useEffect, useRef, RefObject } from 'react';

const useScrollToEnd = (messages: unknown[], streamingContent?: string): RefObject<HTMLDivElement> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    // Scroll immediately for new messages
    scrollToBottom();

    // Also scroll after a short delay to handle dynamic content
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, streamingContent]);

  return ref;
};

export default useScrollToEnd;