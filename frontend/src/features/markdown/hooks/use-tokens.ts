import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { useMemo } from 'react';
import katex from '../utils/katex';

export const markedInstance = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const result = lang ? hljs.highlight(code, { language: lang }).value : hljs.highlightAuto(code).value;
      return result;
    },
  })
);

markedInstance.setOptions({
  breaks: true,
  gfm: true,
});

markedInstance.use(
  katex({
    throwOnError: false,
  })
);

export function useTokens(markdown: string) {
  return useMemo(() => {
    return markedInstance.lexer(markdown);
  }, [markdown]);
}
