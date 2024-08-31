import React from "react";
import "highlight.js/styles/tokyo-night-dark.css";
import CodeBlock from "@/features/markdown/components/code-block";
import InlineCodeBlock from "@/features/markdown/components/inline-code";
import { useTokens } from "../hooks/use-tokens";
import { MarkdownRendererProps } from "../types/markdown";
import he from 'he';


const renderTokens = (tokens: any): React.ReactNode[] => {
  return tokens.map((token: any, index: number) => {
    console.log(token.type)
    switch (token.type) {
      case 'break':
        return <br key={index} />;
      case 'hr':
        return <hr key={index} />;
      case 'blockquote':
        return <blockquote key={index}>{renderTokens(token.tokens)}</blockquote>;
      case 'space':
        return <br key={index} />;
      case 'strong':
        return <strong key={index}>{renderTokens(token.tokens)}</strong>;
      case 'code':
        return <CodeBlock key={index} code={token.text} lang={token?.lang ?? ''} />;
      case 'codespan':
        return <InlineCodeBlock key={index} code={token.text} />;
      case 'em':
        return <em key={index}>{renderTokens(token.tokens)}</em>
      case 'link':
        return <a href={token?.href ?? ''} key={index} title={token.title}>{token.text}</a>
      case 'heading':
        return React.createElement(
          `h${token.depth}`,
          { key: index },
          renderTokens(token.tokens || [token])
        );
      case 'paragraph':
        return <p key={index}>{renderTokens(token.tokens)}</p>;
      case 'text':
        return <span key={index}>{he.decode(token.text)}</span>;
      case 'list':
        return <ol key={index} className="list-decimal pl-5">{renderTokens(token.items)}</ol>;
      case 'list_item':
        return <li key={index}>{renderTokens(token.tokens)}</li>
      case 'table':
        return (
          <table>
            <thead>
              <tr>
                {token.header.map((header, headerIdx) => (
                  <th
                    key={index}
                    style={{ textAlign: token.align[headerIdx] || '' }}
                  >
                    {renderTokens(header.tokens)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {token.rows.map((row, rowIdx) => (
                <tr key={`$key-${index}-row-${rowIdx}`}>
                  {(row ?? []).map((cell, cellIdx) => (
                    <td
                      key={`${index}-row-${rowIdx}-${cellIdx}`}
                      style={{ textAlign: token.align[cellIdx] || '' }}
                    >
                      {renderTokens(cell.tokens)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )
      default:
        return null;
    }
  });
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  const tokens = useTokens(markdown);

  return (
    <div className="rounded-xl overflow-x-scroll max-w-sm min-w-sm md:max-w-lg md:min-w-lg lg:max-w-2xl lg:min-w-2xl xl:max-w-4xl xl:min-w-4xl mx-auto">
      {renderTokens(tokens)}
    </div>
  );
};

export default MarkdownRenderer;
