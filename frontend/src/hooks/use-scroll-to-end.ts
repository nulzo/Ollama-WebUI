import { useEffect, useRef, RefObject } from 'react';

const useScrollToEnd = (messages: unknown[]): RefObject<HTMLDivElement> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return ref;
};

export default useScrollToEnd;
