import { useEffect, useState, useRef, useCallback } from 'react';

interface UseDebouncedScrollOptions {
  debounceTime?: number;
  bottomThreshold?: number;
  topThreshold?: number;
  dependencies?: any[];
}

export function useDebouncedScroll(
  containerRef: React.RefObject<HTMLElement>,
  options: UseDebouncedScrollOptions = {}
) {
  const {
    debounceTime = 100,
    bottomThreshold = 100,
    topThreshold = 100,
    dependencies = [],
  } = options;
  
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isNearTop, setIsNearTop] = useState(false);
  const [scrollHeight, setScrollHeight] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasAtBottomRef = useRef(true);
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  
  const checkScrollPosition = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // With flex-column-reverse, scrollTop of 0 means we're at the bottom
    // and scrollHeight - scrollTop - clientHeight close to 0 means we're at the top
    const atBottom = container.scrollTop < bottomThreshold;
    const nearTop = container.scrollHeight - container.scrollTop - container.clientHeight < topThreshold;
    
    // Only update state if values have changed
    if (atBottom !== isAtBottom) {
      setIsAtBottom(atBottom);
    }
    
    if (nearTop !== isNearTop) {
      setIsNearTop(nearTop);
    }
    
    if (scrollHeight !== container.scrollHeight) {
      setScrollHeight(container.scrollHeight);
    }
    
    // Update ref for use in effects
    wasAtBottomRef.current = atBottom;
  }, [containerRef, bottomThreshold, topThreshold, isAtBottom, isNearTop, scrollHeight]);
  
  const handleScroll = useCallback(() => {
    // Mark that we're currently scrolling and update the timestamp
    isScrollingRef.current = true;
    lastScrollTimeRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      checkScrollPosition();
      
      // If it's been more than 100ms since the last scroll event, we're probably done scrolling
      if (Date.now() - lastScrollTimeRef.current > 100) {
        isScrollingRef.current = false;
      }
    }, debounceTime);
  }, [checkScrollPosition, debounceTime]);
  
  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    
    // Initial check
    checkScrollPosition();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [containerRef, handleScroll, checkScrollPosition]);
  
  // Auto-scroll when dependencies change if we were already at the bottom
  useEffect(() => {
    if (wasAtBottomRef.current) {
      const container = containerRef.current;
      if (!container) return;
      
      // Use RAF to ensure DOM has updated before scrolling
      requestAnimationFrame(() => {
        // Only scroll if we're not already scrolling (prevents jumpy behavior)
        if (!isScrollingRef.current) {
          scrollToBottom('auto');
        } else {
          // If we're already scrolling, wait a bit and then check if we should scroll
          setTimeout(() => {
            if (wasAtBottomRef.current) {
              scrollToBottom('auto');
            }
          }, 50);
        }
      });
    }
    
    // Check position after content changes
    checkScrollPosition();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);
  
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) return;
    
    // Temporarily disable the scroll event handler to prevent feedback loops
    if (container.removeEventListener) {
      container.removeEventListener('scroll', handleScroll);
    }
    
    // With flex-column-reverse, scrolling to bottom means setting scrollTop to 0
    container.scrollTo({
      top: 0,
      behavior,
    });
    
    // Update state immediately rather than waiting for scroll event
    setIsAtBottom(true);
    wasAtBottomRef.current = true;
    
    // Re-enable the scroll event handler after a short delay
    setTimeout(() => {
      if (container.addEventListener) {
        container.addEventListener('scroll', handleScroll);
      }
    }, 50);
  }, [containerRef, handleScroll]);
  
  const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) return;
    
    // With flex-column-reverse, scrolling to top means setting scrollTop to scrollHeight - clientHeight
    container.scrollTo({
      top: container.scrollHeight - container.clientHeight,
      behavior,
    });
    
    // Update state immediately
    setIsAtBottom(false);
    setIsNearTop(true);
  }, [containerRef]);
  
  return {
    isAtBottom,
    isNearTop,
    scrollHeight,
    scrollToBottom,
    scrollToTop,
    checkScrollPosition,
  };
}