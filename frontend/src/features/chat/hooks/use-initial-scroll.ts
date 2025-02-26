import { useEffect, useRef } from 'react';

/**
 * Hook to position a container at the bottom on initial render
 * This ensures the chat starts at the bottom without any visible scrolling animation
 */
export function useInitialScroll(
  containerRef: React.RefObject<HTMLElement>,
  dependencies: any[] = []
) {
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    // Skip if we've already handled the initial scroll
    if (hasScrolledRef.current) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Set initial scroll position without animation
    const setInitialPosition = () => {
      // Disable smooth scrolling temporarily
      const originalScrollBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = 'auto';
      
      // Set scroll position to bottom
      container.scrollTop = container.scrollHeight;
      
      // Mark that we've handled the initial scroll
      hasScrolledRef.current = true;
      
      // Restore original scroll behavior after a short delay
      setTimeout(() => {
        container.style.scrollBehavior = originalScrollBehavior;
      }, 100);
    };
    
    // Use requestAnimationFrame to ensure the DOM has been painted
    requestAnimationFrame(() => {
      setInitialPosition();
    });
    
    // Also use a timeout as a fallback
    const timeoutId = setTimeout(() => {
      if (!hasScrolledRef.current) {
        setInitialPosition();
      }
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, dependencies); // Re-run if dependencies change and we haven't scrolled yet
  
  return {
    reset: () => {
      hasScrolledRef.current = false;
    }
  };
} 