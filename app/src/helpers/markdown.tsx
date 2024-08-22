import React, { useEffect, useRef } from "react";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

interface MarkdownRendererProps {
  markdown: string;
}

const markedInstance = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code) {
      const result = hljs.highlightAuto(code);
      return result.value;
    },
  })
);

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  const containerRef = useRef(null);
  useEffect(() => {
    hljs.highlightAll();
  }, [markdown]);
  const html = markedInstance.parse(markdown);
  return (
    <div
      className="rounded-xl w-full text-sm"
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownRenderer;
