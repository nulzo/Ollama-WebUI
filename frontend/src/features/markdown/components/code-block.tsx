import { useClipboard } from '@/hooks/use-clipboard';
import CodeCopyButton from './copy-button';
import hljs from 'highlight.js';
import MermaidComponent from '@/features/markdown/components/mermaid.tsx';

interface CodeBlockProps {
  code: string;
  lang?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, lang }) => {
  const { copy, copied } = useClipboard();
  const isMermaid = lang === 'mermaid';

  const handleCopy = () => {
    copy(code);
  };

  const { value: highlightedCode, language } = isMermaid
    ? { value: code, language: 'mermaid' }
    : hljs.highlightAuto(code, hljs.getLanguage(lang || '')?.aliases);

  return (
    <div className="relative mx-4 my-6 rounded-lg text-sm overflow-hidden">
      <div className="flex justify-between items-center bg-secondary/50 backdrop-blur-sm p-2">
        <span className="pl-2 text-muted-foreground text-xs">
          {lang || language || 'plaintext'}
        </span>
        <CodeCopyButton onClick={handleCopy} copied={copied} />
      </div>
      <pre className="bg-secondary/50 backdrop-blur-sm px-4 py-3 pb-4 rounded-t-none overflow-x-scroll">
        {isMermaid ? (
          <MermaidComponent code={code} />
        ) : (
          <code className="mt-0 mb-3 text-sm" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        )}
      </pre>
    </div>
  );
};

export default CodeBlock;
