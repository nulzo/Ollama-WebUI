import CodeBlock from '@/features/markdown/components/code-block';
import InlineCodeBlock from '@/features/markdown/components/inline-code';
import { useTokens } from '../hooks/use-tokens';
import { MarkdownRendererProps } from '../types/markdown';
import he from 'he';
import KatexRenderer from './katex';
import DOMPurify from 'dompurify';
import MarkdownInlineTokens from './markdown-inline';


const renderTokens = (tokens: any): React.ReactNode[] => {
  return tokens.map((token: any, index: number) => {
    switch (token.type) {
      case 'break':
        return <div className="my-0.5" key={index} />;
      case 'hr':
        return <hr key={index} />;
      case 'blockquote':
        return (
          <blockquote key={index} className="mt-6 border-l-2 pl-6 italic">
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
              className="leading-9 [&:not(:first-child)]:mt-10 [&:first-child]:mt-2 scroll-m-20 text-4xl font-bold tracking-tight"
            >
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h1>
          );
        } else if (token?.depth === 2) {
          return (
            <h2
              key={index}
              className="leading-7 [&:not(:first-child)]:mt-8 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
            >
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h2>
          );
        } else if (token?.depth === 3) {
          return (
            <h3
              key={index}
              className="leading-7 [&:not(:first-child)]:mt-8 scroll-m-20 text-2xl font-semibold tracking-tight"
            >
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h3>
          );
        } else if (token?.depth === 4) {
          return (
            <h4
              key={index}
              className="leading-7 [&:not(:first-child)]:mt-4 scroll-m-20 text-lg font-semibold tracking-tight"
            >
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h4>
          );
        } else if (token?.depth === 5) {
          return (
            <h5 key={index} className="scroll-m-20 text-md font-semibold tracking-tight">
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
          <p key={index} className="leading-7 [&:not(:first-child)]:mt-4">
            <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens ?? []} /> 
          </p>
        );
        case 'text':
          return token.tokens ? (
            <span key={index}>{renderTokens(token.tokens)}</span>
          ) : (
            <div className='whitespace-wrap' key={index}>{he.decode(token.text)}</div>
          );
      case 'list':
        return token.ordered ? (
          <ol key={index} start={token.start || 1} className="my-6 ml-6 list-decimal [&>li]:mt-2">
            {token.items.map((item: any, itemIdx: number) => (
              <li key={`${index}-${itemIdx}`}>
                {renderTokens(item.tokens)}
              </li>
            ))}
          </ol>
        ) : (
          <ul key={index} className="my-6 ml-6 list-disc [&>li]:mt-2">
            {token.items.map((item: any, itemIdx: number) => (
              <li key={`${index}-${itemIdx}`}>
                {renderTokens(item.tokens)}
              </li>
            ))}
          </ul>
        );
      case 'list_item':
        return <li className='flex whitespace-wrap' key={index}>{renderTokens(token.tokens)}</li>;
      case 'table':
        return (
          <div className="rounded-xl">
            <table className="w-[100%] min-w-2xl ">
              <thead className="">
                <tr className="m-0 border-t p-0 even:bg-muted">
                  {token.header.map((header: any, headerIdx: any) => (
                    <th
                      key={index}
                      style={{ textAlign: token.align[headerIdx] || '' }}
                      className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
                    >
                      {renderTokens(header.tokens)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {token.rows.map((row: any, rowIdx: any) => (
                  <tr
                    key={`$key-${index}-row-${rowIdx}`}
                    className="m-0 border-t p-0 even:bg-muted/50 backdrop-blur"
                  >
                    {(row ?? []).map((cell: any, cellIdx: any) => (
                      <td
                        key={`${index}-row-${rowIdx}-${cellIdx}`}
                        style={{ textAlign: token.align[cellIdx] || '' }}
                        className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
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
        return (
          <KatexRenderer
            content={token.text}
            displayMode={true}
          />
        );
      case 'inlineKatex':
        return (
          <KatexRenderer
            content={token.text}
            displayMode={false}
          />
        );
      case 'space':
        return <div className="h-4" key={index} />;
      default:
        return null;
    }
  });
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  const tokens = useTokens(markdown);

  return (
    <div className="markdown-prose markdown overflow-x-scroll max-w-sm min-w-sm md:max-w-lg md:min-w-lg lg:max-w-2xl lg:min-w-2xl xl:max-w-4xl xl:min-w-4xl w-full mx-auto">
      {renderTokens(tokens)}
    </div>
  );
};

export default MarkdownRenderer;
