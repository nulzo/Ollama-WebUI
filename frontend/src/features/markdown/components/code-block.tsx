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
    <div className="text-sm relative rounded-lg overflow-hidden my-6 mx-4">
      <div className="flex justify-between items-center backdrop-blur bg-secondary/50 p-2">
        <span className="pl-2 text-xs text-muted-foreground">
          {lang || language || 'plaintext'}
        </span>
        <CodeCopyButton onClick={handleCopy} copied={copied} />
      </div>
      <pre className="pb-4 px-4 py-3 backdrop-blur bg-secondary/50 rounded-t-none overflow-x-scroll">
        {isMermaid ? (
          <MermaidComponent code={code} />
        ) : (
          <code className="mt-0 mb-3" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        )}
      </pre>
    </div>
  );
};

export default CodeBlock;
