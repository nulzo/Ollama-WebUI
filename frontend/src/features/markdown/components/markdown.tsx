import React from "react";
import "highlight.js/styles/tokyo-night-dark.css";
import CodeBlock from "@/features/markdown/components/code-block";
import InlineCodeBlock from "@/features/markdown/components/inline-code";
import { useTokens } from "../hooks/use-tokens";
import { MarkdownRendererProps } from "../types/markdown";
import he from 'he';

const renderTokens = (tokens: any): React.ReactNode[] => {
  return tokens.map((token: any, index: number) => {
    switch (token.type) {
      case 'space':
        return <br key={index} />;
      case 'code':
        return <CodeBlock key={index} code={token.text} />;
      case 'codespan':
        return <InlineCodeBlock key={index} code={token.text} />;
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
      default:
        return null;
    }
  });
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  const tokens = useTokens(markdown);

  return <div className="rounded-xl max-w-full">{renderTokens(tokens)}</div>;
};

export default MarkdownRenderer;
