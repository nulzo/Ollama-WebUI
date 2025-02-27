/**
 * Creates a throttled function that only invokes the provided function at most once per
 * specified interval.
 * 
 * @param func The function to throttle
 * @param wait The number of milliseconds to throttle invocations to
 * @returns The throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T & { cancel: () => void } {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let lastArgs: Parameters<T> | null = null;
    let lastCallTime = 0;
  
    function invoke() {
      if (lastArgs) {
        func(...lastArgs);
        lastArgs = null;
        lastCallTime = Date.now();
      }
    }
  
    function throttled(this: any, ...args: Parameters<T>) {
      const now = Date.now();
      const remaining = wait - (now - lastCallTime);
  
      lastArgs = args;
  
      if (remaining <= 0) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        invoke();
      } else if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null;
          invoke();
        }, remaining);
      }
    }
  
    throttled.cancel = function() {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
        lastArgs = null;
      }
    };
  
    return throttled as T & { cancel: () => void };
  }