import { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { throttle } from '@/utils/throttle';

export const useMessageScroll = (messages: any[]) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const userScrolledUp = useRef(false);

  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior });
    }
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container) {
      scrollToBottom('auto');
    }
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      if (!userScrolledUp.current) {
        scrollToBottom('smooth');
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [scrollToBottom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 200;
      userScrolledUp.current = !isAtBottom;
      setShowScrollButton(!isAtBottom);
    };

    const throttledHandleScroll = throttle(handleScroll, 150);
    container.addEventListener('scroll', throttledHandleScroll);
    handleScroll();

    return () => {
      container.removeEventListener('scroll', throttledHandleScroll);
      throttledHandleScroll.cancel();
    };
  }, []);

  const handleScrollToBottomClick = useCallback(() => {
    userScrolledUp.current = false;
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  return { containerRef, showScrollButton, scrollToBottom: handleScrollToBottomClick };
}; 