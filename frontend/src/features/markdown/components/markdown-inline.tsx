import React from 'react';
import DOMPurify from 'dompurify';
import type { Token } from 'marked';
import he from 'he';
import KatexRenderer from './katex';

interface MarkdownInlineTokensProps {
  id: string;
  tokens: Token[];
}

const revertSanitizedResponseContent = (content: string) => {
  return content.replace('&lt;', '<').replace('&gt;', '>');
};

const MarkdownInlineTokens: React.FC<MarkdownInlineTokensProps> = ({ id, tokens }) => {
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
            if (token.tokens) {
              return (
                <a key={key} href={token.href} target="_blank" rel="nofollow" title={token.title}>
                  <MarkdownInlineTokens id={`${key}-a`} tokens={token.tokens} />
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
            return (
              <strong key={key} className="text-primary">
                <MarkdownInlineTokens id={`${key}-strong`} tokens={token.tokens} />
              </strong>
            );
          case 'em':
            return (
              <em key={key}>
                <MarkdownInlineTokens id={`${key}-em`} tokens={token.tokens} />
              </em>
            );
          case 'codespan':
            return (
              <code key={key} className="cursor-pointer codespan">
                {he.escape(token.text)}
              </code>
            );
          case 'br':
            return <br key={key} />;
          case 'del':
            return (
              <del key={key}>
                <MarkdownInlineTokens id={`${key}-del`} tokens={token.tokens} />
              </del>
            );
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
          default:
            console.log('Unknown inline token', token);
            return null;
        }
      })}
    </>
  );
};

export default MarkdownInlineTokens;
