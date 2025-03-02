import { MarkedExtension, Tokens, RendererThis } from 'marked';

interface InlineCitationToken extends Tokens.Generic {
  type: 'inlineCitation';
  raw: string;
  citationId: string;
}

export function citationExtension(): MarkedExtension {
  // Define a simple non-global regex for matching citation markers
  const citationRegex = /\[\^cite:([a-zA-Z0-9_-]+)\]/;
  
  console.log('Citation extension initialized with regex:', citationRegex);
  
  return {
    extensions: [
      {
        name: 'inlineCitation',
        level: 'inline' as const,
        start(src: string) {
          // Find the first occurrence of a citation marker
          const match = src.match(citationRegex);
          if (!match) return -1;
          
          const position = match.index || -1;
          if (position !== -1) {
            console.log(`Citation marker found at position ${position}`);
          }
          return position;
        },
        tokenizer(src: string): InlineCitationToken | undefined {
          // Extract the citation ID from the marker
          const match = citationRegex.exec(src);
          if (!match) return undefined;
          
          const [fullMatch, citationId] = match;
          console.log(`Tokenizing citation: ${citationId}`);
          
          return {
            type: 'inlineCitation',
            raw: fullMatch,
            citationId: citationId,
            tokens: []
          };
        },
        renderer(this: RendererThis, token: Tokens.Generic) {
          // Cast to our custom token type
          const citationToken = token as InlineCitationToken;
          
          // Create a unique span for this citation
          const uniqueId = `citation-${citationToken.citationId}-${Math.random().toString(36).substring(2, 9)}`;
          console.log(`Rendering citation ${citationToken.citationId} with unique ID: ${uniqueId}`);
          
          return `<span class="inline-citation" id="${uniqueId}" data-citation-id="${citationToken.citationId}"></span>`;
        }
      }
    ]
  };
} 