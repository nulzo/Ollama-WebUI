import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { useMemo } from 'react';
import katex from '../utils/katex';
import katexExtension from '@/lib/katex';

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

markedInstance.use({
  extensions: [{
    name: 'thinkBlock',
    level: 'block',
    start(src) {
      return src.match(/^<think>/)?.index;
    },
    tokenizer(src) {
      const rule = /^<think>([\s\S]*?)<\/think>/;
      const match = rule.exec(src);
      if (match) {
        return {
          type: 'html',
          raw: match[0],
          text: match[0],
          tokens: []
        };
      }
    }
  }]
});

export function useTokens(markdown: string) {
  return useMemo(() => {
    return markedInstance.lexer(markdown);
  }, [markdown]);
}
