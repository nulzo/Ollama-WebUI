import CodeBlock from '@/features/markdown/components/code-block';
import InlineCodeBlock from '@/features/markdown/components/inline-code';
import { markedInstance, useTokens } from '../hooks/use-tokens';
import { MarkdownRendererProps } from '../types/markdown';
import he from 'he';
import KatexRenderer from './katex';
import DOMPurify from 'dompurify';
import MarkdownInlineTokens from './markdown-inline';
import { memo, useMemo } from 'react';
import { ThinkBlock } from './think-block';

const renderTokens = (tokens: any): React.ReactNode[] => {
  return tokens.map((token: any, index: number) => {
    switch (token.type) {
      case 'break':
        return <div className="my-0.5" key={index} />;
      case 'hr':
        return <hr key={index} className="my-1" />;
      case 'blockquote':
        return (
          <blockquote key={index} className="mt-6 pl-6 border-l-2 italic">
            {renderTokens(token.tokens)}
          </blockquote>
        );
      case 'strong':
        return <strong key={index}>{renderTokens(token.tokens)}</strong>;
      case 'code':
        return <CodeBlock key={index} code={token.text} lang={token?.lang ?? ''} />;
      case 'codespan':
        return <InlineCodeBlock key={index} code={token.text} />;
      case 'em':
        return <em key={index}>{renderTokens(token.tokens)}</em>;
      case 'link':
        return (
          <a href={token?.href ?? ''} key={index} title={token.title}>
            {token.text}
          </a>
        );
      case 'heading':
        if (token?.depth === 1) {
          return (
            <h1
              key={index}
              className="scroll-m-20 not-first:mt-10 first:mt-2 font-bold text-4xl leading-9 tracking-tight"
            >
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h1>
          );
        } else if (token?.depth === 2) {
          return (
            <h2
              key={index}
              className="scroll-m-20 not-first:mt-8 first:mt-0 pb-2 border-b font-semibold text-3xl leading-7 tracking-tight"
            >
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h2>
          );
        } else if (token?.depth === 3) {
          return (
            <h3
              key={index}
              className="scroll-m-20 not-first:mt-8 font-semibold text-2xl leading-7 tracking-tight"
            >
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h3>
          );
        } else if (token?.depth === 4) {
          return (
            <h4
              key={index}
              className="scroll-m-20 not-first:mt-4 font-semibold text-lg leading-7 tracking-tight"
            >
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h4>
          );
        } else if (token?.depth === 5) {
          return (
            <h5 key={index} className="scroll-m-20 font-semibold text-md tracking-tight">
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h5>
          );
        } else {
          return (
            <h6 key={index} className="scroll-m-20 font-semibold tracking-tight">
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h6>
          );
        }
      case 'paragraph':
        return (
          <p key={index} className="not-first:mt-4 leading-7">
            <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens ?? []} />
          </p>
        );
      case 'text':
        return token.tokens ? (
          <span key={index}>{renderTokens(token.tokens)}</span>
        ) : (
          <span className="whitespace-wrap" key={index}>
            {he.decode(token.text)}
          </span>
        );
      case 'list':
        return token.ordered ? (
          <ol key={index} start={token.start || 1} className="my-6 ml-6 list-decimal prose markdown-prose [&>li]:mt-2">
            {token.items.map((item: any, itemIdx: number) => (
              <li key={`${index}-${itemIdx}`}>{renderTokens(item.tokens)}</li>
            ))}
          </ol>
        ) : (
          <ul key={index} className="my-6 ml-6 list-disc prose markdown-prose [&>li]:mt-2">
            {token.items.map((item: any, itemIdx: number) => (
              <li key={`${index}-${itemIdx}`}>{renderTokens(item.tokens)}</li>
            ))}
          </ul>
        );
      case 'list_item':
        return (
          <li className="flex whitespace-wrap prose markdown-prose" key={index}>
            {renderTokens(token.tokens)}
          </li>
        );
      case 'table':
        return (
          <div className="shadow-xs rounded-xl overflow-x-auto">
            <table className="rounded-xl w-full min-w-5xl overflow-hidden table-auto">
              <thead className="bg-muted/25">
                <tr className="m-0 p-0 border whitespace-nowrap">
                  {token.header.map((header: any, headerIdx: number) => (
                    <th
                      key={`header-${headerIdx}`}
                      style={{ textAlign: token.align[headerIdx] || '' }}
                      className="[&[align=right]]:text-right px-3 py-2 border font-semibold text-nowrap [&[align=center]]:text-center whitespace-break-spaces"
                    >
                      {renderTokens(header.tokens)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {token.rows.map((row: any, rowIdx: number) => (
                  <tr key={`row-${rowIdx}`} className="even:bg-muted/25 m-0 p-0 border-t">
                    {(row ?? []).map((cell: any, cellIdx: number) => (
                      <td
                        key={`cell-${rowIdx}-${cellIdx}`}
                        style={{ textAlign: token.align[cellIdx] || '' }}
                        className="[&[align=right]]:text-right px-4 py-2 border text-nowrap [&[align=center]]:text-center whitespace-break-spaces"
                      >
                        {renderTokens(cell.tokens)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'html':
        return <div key={index}>{DOMPurify.sanitize(token.text)}</div>;
      case 'blockKatex':
        return <KatexRenderer content={token.text} displayMode={true} />;
        case 'thinkBlock':
          return (
            <ThinkBlock key={index} isComplete={token.isComplete}>
              <div className="prose prose-sm max-w-none">
                <MarkdownRenderer markdown={token.text} />
              </div>
            </ThinkBlock>
          );
      case 'inlineKatex':
        return <KatexRenderer content={token.text} displayMode={false} />;
      case 'space':
        return <div className="h-1" key={index} />;
      default:
        return null;
    }
  });
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = memo(({ markdown }) => {
  const tokens = useTokens(markdown);

  const renderedContent = useMemo(() => {
    return renderTokens(tokens);
  }, [tokens]);

  return <div className="w-full overflow-none markdown markdown-prose prose">{renderedContent}</div>;
});

export default MarkdownRenderer;
