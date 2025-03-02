import CodeBlock from '@/features/markdown/components/code-block';
import InlineCodeBlock from '@/features/markdown/components/inline-code';
import { markedInstance, useTokens } from '../hooks/use-tokens';
import { MarkdownRendererProps } from '../types/markdown';
import he from 'he';
import KatexRenderer from './katex';
import DOMPurify from 'dompurify';
import MarkdownInlineTokens from './markdown-inline';
import { memo, useMemo, useEffect, useRef, useState } from 'react';
import { ThinkBlock } from './think-block';
import InlineCitation from './inline-citation';

const renderTokens = (tokens: any, citations?: any[]): React.ReactNode[] => {
  return tokens.map((token: any, index: number) => {
    switch (token.type) {
      case 'break':
        return <div className="my-0.5" key={index} />;
      case 'hr':
        return <hr key={index} className="my-1" />;
      case 'blockquote':
        return (
          <blockquote key={index} className="mt-6 pl-6 border-l-2 italic">
            {renderTokens(token.tokens, citations)}
          </blockquote>
        );
      case 'strong':
        return <strong key={index}>{renderTokens(token.tokens, citations)}</strong>;
      case 'code':
        return <CodeBlock key={index} code={token.text} lang={token?.lang ?? ''} />;
      case 'codespan':
        return <InlineCodeBlock key={index} code={token.text} />;
      case 'em':
        return <em key={index}>{renderTokens(token.tokens, citations)}</em>;
      case 'link':
        return (
          <a href={token?.href ?? ''} key={index} title={token.title}>
            {token.text}
          </a>
        );
      case 'inlineCitation':
        if (citations && citations.length > 0) {
          // Find the citation index for display
          const citationIndex = citations.findIndex(c => c.chunk_id === token.citationId) + 1;
          return <InlineCitation key={index} citationId={token.citationId} citationIndex={citationIndex} citations={citations} />;
        }
        return <sup key={index}>[?]</sup>;
      case 'heading':
        if (token?.depth === 1) {
          return (
            <h1
              key={index}
              className="first:mt-2 not-first:mt-10 font-bold text-4xl leading-9 tracking-tight scroll-m-20"
            >
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h1>
          );
        } else if (token?.depth === 2) {
          return (
            <h2
              key={index}
              className="first:mt-0 not-first:mt-8 pb-2 border-b font-semibold text-3xl leading-7 tracking-tight scroll-m-20"
            >
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h2>
          );
        } else if (token?.depth === 3) {
          return (
            <h3
              key={index}
              className="not-first:mt-8 font-semibold text-2xl leading-7 tracking-tight scroll-m-20"
            >
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h3>
          );
        } else if (token?.depth === 4) {
          return (
            <h4
              key={index}
              className="not-first:mt-4 font-semibold text-lg leading-7 tracking-tight scroll-m-20"
            >
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h4>
          );
        } else if (token?.depth === 5) {
          return (
            <h5 key={index} className="font-semibold text-md tracking-tight scroll-m-20">
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h5>
          );
        } else {
          return (
            <h6 key={index} className="font-semibold tracking-tight scroll-m-20">
              <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens} />
            </h6>
          );
        }
      case 'paragraph':
        return (
          <p key={index} className="not-first:mt-4 leading-7">
            <MarkdownInlineTokens id={`${index}-p`} tokens={token.tokens ?? []} citations={citations} />
          </p>
        );
      case 'text':
        return token.tokens ? (
          <span key={index}>{renderTokens(token.tokens, citations)}</span>
        ) : (
          <span className="whitespace-wrap" key={index}>
            {he.decode(token.text)}
          </span>
        );
      case 'list':
        return token.ordered ? (
          <ol key={index} start={token.start || 1} className="my-6 ml-6 list-decimal prose markdown-prose [&>li]:mt-2">
            {token.items.map((item: any, itemIdx: number) => (
              <li key={`${index}-${itemIdx}`}>{renderTokens(item.tokens, citations)}</li>
            ))}
          </ol>
        ) : (
          <ul key={index} className="my-6 ml-6 list-disc prose markdown-prose [&>li]:mt-2">
            {token.items.map((item: any, itemIdx: number) => (
              <li key={`${index}-${itemIdx}`}>{renderTokens(item.tokens, citations)}</li>
            ))}
          </ul>
        );
      case 'list_item':
        return (
          <li className="flex whitespace-wrap prose markdown-prose" key={index}>
            {renderTokens(token.tokens, citations)}
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
                      className="px-3 py-2 border font-semibold [&[align=center]]:text-center [&[align=right]]:text-right text-nowrap whitespace-break-spaces"
                    >
                      {renderTokens(header.tokens, citations)}
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
                        className="px-4 py-2 border [&[align=center]]:text-center [&[align=right]]:text-right text-nowrap whitespace-break-spaces"
                      >
                        {renderTokens(cell.tokens, citations)}
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
              <div className="max-w-none prose prose-sm">
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

const MarkdownRenderer: React.FC<MarkdownRendererProps> = memo(({ markdown, citations }) => {
  const tokens = useTokens(markdown);
  const containerRef = useRef<HTMLDivElement>(null);
  // Add state to track if citations have been processed
  const [citationsProcessed, setCitationsProcessed] = useState(false);

  const renderedContent = useMemo(() => {
    return renderTokens(tokens, citations);
  }, [tokens, citations]);

  // Process inline citation spans after rendering
  useEffect(() => {
    if (!containerRef.current || !citations || !citations.length) return;
    
    // Find all inline citation spans and replace them with the actual citation components
    const citationSpans = containerRef.current.querySelectorAll('.inline-citation:not(.processed)');
    console.log(`Found ${citationSpans.length} unprocessed citation spans`);
    
    // If no citation spans found but citations exist, try again after a short delay
    if (citationSpans.length === 0 && citations.length > 0 && !citationsProcessed) {
      const timer = setTimeout(() => {
        setCitationsProcessed(true);
        // Force re-processing
        processCitationSpans();
      }, 50);
      return () => clearTimeout(timer);
    }
    
    processCitationSpans();
    
    // Function to process citation spans
    function processCitationSpans() {
      const spans = containerRef.current?.querySelectorAll('.inline-citation:not(.processed)');
      if (!spans || !citations) return;
      
      console.log(`Processing ${spans.length} citation spans`);
      
      spans.forEach((span) => {
        const citationId = span.getAttribute('data-citation-id');
        if (!citationId) return;
        
        // Mark as processed to prevent duplicate processing
        span.classList.add('processed');
        
        // Find the citation index
        const citationIndex = citations.findIndex(c => c.chunk_id === citationId) + 1;
        if (citationIndex === 0) return; // Not found
        
        // Replace the span text with the citation number
        span.textContent = `[${citationIndex}]`;
        span.classList.add('cursor-pointer', 'text-primary', 'hover:text-primary/80', 'font-medium', 'align-super', 'text-xs');
        
        // Add tooltip functionality
        span.addEventListener('mouseenter', (e) => {
          // Remove any existing tooltips first
          document.querySelectorAll('.citation-tooltip').forEach(el => el.remove());
          
          const citation = citations.find(c => c.chunk_id === citationId);
          if (!citation) return;
          
          // Create tooltip
          const tooltip = document.createElement('div');
          tooltip.className = 'citation-tooltip absolute bg-popover text-popover-foreground p-2 rounded-md shadow-md text-xs max-w-xs z-50';
          
          // Position the tooltip above the citation
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          tooltip.style.top = `${window.scrollY + rect.top - 10}px`;
          tooltip.style.left = `${window.scrollX + rect.left}px`;
          tooltip.style.transform = 'translateY(-100%)';
          
          // Add citation content
          tooltip.innerHTML = `
            <div class="font-semibold">${citation.text}</div>
            ${citation.metadata?.source ? `<div>Source: ${citation.metadata.source}</div>` : ''}
            ${citation.metadata?.page ? `<div>Page: ${citation.metadata.page}</div>` : ''}
            ${citation.metadata?.row ? `<div>Row: ${citation.metadata.row}</div>` : ''}
          `;
          
          document.body.appendChild(tooltip);
          
          // Remove tooltip on mouseleave
          span.addEventListener('mouseleave', () => {
            tooltip.remove();
          }, { once: true });
        });
      });
    }
  }, [renderedContent, citations, citationsProcessed]);

  return <div ref={containerRef} className="w-full overflow-none markdown markdown-prose prose">{renderedContent}</div>;
});

export default MarkdownRenderer;
