import { useEffect, useRef } from 'react';
import hljs from 'highlight.js';

export function useHighlightedCode(code: string) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      hljs.highlightAuto(code);
    }
  }, [code]);

  return ref;
}
