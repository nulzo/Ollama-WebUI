import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { useMemo } from 'react';
import katex from '../utils/katex';
import katexExtension from '@/lib/katex';
import {thinkExtension} from '@/lib/think';
import { citationExtension } from '@/lib/citation';

export const markedInstance = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const result = lang
        ? hljs.highlight(code, { language: lang }).value
        : hljs.highlightAuto(code).value;
      return result;
    },
  })
);

markedInstance.setOptions({
  breaks: true,
  gfm: true,
});

markedInstance.use(katexExtension());
markedInstance.use(thinkExtension());
markedInstance.use(citationExtension());

export function useTokens(markdown: string) {
  return useMemo(() => {
    return markedInstance.lexer(markdown);
  }, [markdown]);
}
