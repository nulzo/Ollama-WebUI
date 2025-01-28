import { cn } from '@/lib/utils';
import katex from 'katex';
import 'katex/contrib/mhchem/mhchem.js';
import 'katex/dist/katex.min.css';

interface KatexRendererProps {
  content: string;
  displayMode?: boolean;
}

const KatexRenderer: React.FC<KatexRendererProps> = ({ content, displayMode = false }) => {
  try {
    const renderedContent = katex.renderToString(content, {
      displayMode,
      throwOnError: false,
      errorColor: '#ef4444',
      strict: false,
      trust: true,
      macros: {
        "\\R": "\\mathbb{R}",
        "\\N": "\\mathbb{N}",
        "\\Z": "\\mathbb{Z}",
        "\\Q": "\\mathbb{Q}",
        "\\C": "\\mathbb{C}",
      },
      globalGroup: true,
      output: 'htmlAndMathml',
      minRuleThickness: 0.10,
      maxSize: Infinity,
      maxExpand: 1000,
    });

    return (
      <span
        className={cn(
          "katex-container",
          displayMode ? "block text-center my-2" : "inline-block align-middle"
        )}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    );
  } catch (error) {
    console.error('KaTeX rendering error:', error);
    return <span className="text-destructive">{content}</span>;
  }
};

export default KatexRenderer;