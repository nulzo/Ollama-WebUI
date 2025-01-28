import { marked } from 'marked';

export function thinkExtension() {
  return {
    extensions: [
      {
        name: 'thinkBlock',
        level: 'block',
        start(src: string) {
          return src.match(/<think>/)?.index;
        },
        tokenizer(src: string) {
          // Check for an opening think tag with content
          const openPattern = /<think>([\s\S]*?)(?:<\/think>|$)/;
          const match = openPattern.exec(src);
          
          if (match) {
            const content = match[1];
            const isComplete = src.includes('</think>');
            
            return {
              type: 'thinkBlock',
              raw: match[0],
              text: content.trim(),
              isComplete: isComplete
            };
          }
        },
        renderer(token: marked.Tokens.Generic) {
          return `<div class="think-block">${this.parser.parse(token.text)}</div>`;
        }
      }
    ]
  };
}