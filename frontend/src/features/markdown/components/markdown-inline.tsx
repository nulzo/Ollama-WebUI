import React from 'react';
import DOMPurify from 'dompurify';
import type { Token } from 'marked';
import he from 'he';
import KatexRenderer from './katex';
import InlineCitation from './inline-citation';

export interface MarkdownInlineTokensProps {
  id: string;
  tokens: Token[];
  citations?: Array<{
    text: string;
    chunk_id: string;
    knowledge_id: string;
    metadata?: {
      source?: string;
      page?: number;
      row?: number;
      citation?: string;
      [key: string]: any;
    };
  }>;
}

const revertSanitizedResponseContent = (content: string) => {
  return content.replace('&lt;', '<').replace('&gt;', '>');
};

const MarkdownInlineTokens: React.FC<MarkdownInlineTokensProps> = ({ id, tokens, citations }) => {
  if (!tokens || tokens.length === 0) {
    return null;
  }
  
  return (
    <>
      {tokens.map((token, index) => {
        const key = `${id}-${index}`;

        switch (token.type) {
          case 'escape':
            return <span key={key}>{he.escape(token.text)}</span>;
          case 'html':
            const html = DOMPurify.sanitize(token.text);
            return <span key={key}>{token.text}</span>;

          case 'link':
            if (token.tokens && token.tokens.length > 0) {
              return (
                <a key={key} href={token.href} target="_blank" rel="nofollow" title={token.title}>
                  <MarkdownInlineTokens id={`${key}-a`} tokens={token.tokens} citations={citations} />
                </a>
              );
            } else {
              return (
                <a key={key} href={token.href} target="_blank" rel="nofollow" title={token.title}>
                  {token.text}
                </a>
              );
            }

          case 'strong':
            if (token.tokens && token.tokens.length > 0) {
              return (
                <strong key={key} className="text-primary">
                  <MarkdownInlineTokens id={`${key}-strong`} tokens={token.tokens} citations={citations} />
                </strong>
              );
            } else {
              return <strong key={key} className="text-primary">{token.text}</strong>;
            }

          case 'em':
            if (token.tokens && token.tokens.length > 0) {
              return (
                <em key={key}>
                  <MarkdownInlineTokens id={`${key}-em`} tokens={token.tokens} citations={citations} />
                </em>
              );
            } else {
              return <em key={key}>{token.text}</em>;
            }

          case 'codespan':
            return (
              <code key={key} className="codespan">
                {he.escape(token.text)}
              </code>
            );
          case 'br':
            return <br key={key} />;
          case 'del':
            if (token.tokens && token.tokens.length > 0) {
              return (
                <del key={key}>
                  <MarkdownInlineTokens id={`${key}-del`} tokens={token.tokens} citations={citations} />
                </del>
              );
            } else {
              return <del key={key}>{token.text}</del>;
            }

          case 'inlineKatex':
            if (token.text) {
              return (
                <KatexRenderer
                  key={key}
                  content={revertSanitizedResponseContent(token.text)}
                  displayMode={false}
                />
              );
            }
            return null;

          case 'text':
            return <span key={key}>{token.raw}</span>;

          case 'inlineCitation':
            if (citations && citations.length > 0) {
              // Find the citation index for display
              const citationToken = token as any; // Type assertion for the custom token
              const citationIndex = citations.findIndex(c => c.chunk_id === citationToken.citationId) + 1;
              if (citationIndex > 0) {
                return <InlineCitation key={key} citationId={citationToken.citationId} citationIndex={citationIndex} citations={citations} />;
              }
            }
            return <sup key={key}>[?]</sup>;

          default:
            return null;
        }
      })}
    </>
  );
};

export default MarkdownInlineTokens;
